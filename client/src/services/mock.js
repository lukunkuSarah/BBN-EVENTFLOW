// Mock d'API (mode démo, VITE_USE_MOCK=1) : reproduit les routes du serveur Express
// sans backend. Les données sont conservées dans localStorage pour survivre au
// rechargement de la page. Comptes de démo :
//   demo@eventflow.local   / demo1234   (admin)
//   membre@eventflow.local / membre1234 (membre)

const STORAGE_KEY = 'eventflow_mock_v1'

let users = []          // { id, email, name, password, is_admin }
let events = []         // { id, title, description, date, capacity, created_by }
let registrations = []  // { event_id, user_id, created_at }
let nextUserId = 1
let nextEventId = 1

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(18, 0, 0, 0)
  return d.toISOString()
}

function seed() {
  users = [
    { id: 1, email: 'demo@eventflow.local', name: 'Demo Admin', password: 'demo1234', is_admin: true },
    { id: 2, email: 'membre@eventflow.local', name: 'Membre Demo', password: 'membre1234', is_admin: false },
  ]
  nextUserId = 3
  events = [
    { id: 1, title: 'Atelier Vue 3', description: 'Découverte de Vue 3 et Pinia.', date: daysFromNow(1), capacity: 50, created_by: 1 },
    { id: 2, title: 'API avec Express', description: 'Construire une API REST et SSE avec Express.', date: daysFromNow(2), capacity: 100, created_by: 1 },
    { id: 3, title: 'PostgreSQL pour débutants', description: 'Modélisation, requêtes et index.', date: daysFromNow(3), capacity: 80, created_by: 1 },
  ]
  nextEventId = 4
  registrations = [
    { event_id: 1, user_id: 2, created_at: new Date().toISOString() },
  ]
  save()
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, events, registrations, nextUserId, nextEventId }))
  } catch {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const s = JSON.parse(raw)
    if (!Array.isArray(s.users) || !Array.isArray(s.events)) return false
    users = s.users
    events = s.events
    registrations = Array.isArray(s.registrations) ? s.registrations : []
    nextUserId = s.nextUserId || users.length + 1
    nextEventId = s.nextEventId || events.length + 1
    return true
  } catch {
    return false
  }
}

if (!load()) seed()

// ── Helpers ───────────────────────────────────────────────────────────────────
function ok(data, status = 200) { return Promise.resolve({ status, data }) }
function fail(status, message) {
  const err = new Error(message || 'Request failed')
  err.response = { status, data: { message } }
  return Promise.reject(err)
}

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, is_admin: u.is_admin === true }
}

function makeToken(u) { return `user:${u.id}` }

function authUser(config) {
  const h = (config && config.headers && config.headers.Authorization) || ''
  const m = /^Bearer\s+(.+)$/.exec(h)
  if (!m) return null
  const token = m[1]
  if (!token.startsWith('user:')) return null
  const ref = token.slice(5)
  const id = Number(ref)
  if (Number.isFinite(id)) return users.find((u) => u.id === id) || null
  // Ancien format de jeton (user:<email>) : sessions créées avant la refonte du mock
  return users.find((u) => u.email === ref) || null
}

function registeredCount(eventId) {
  return registrations.filter((r) => r.event_id === eventId).length
}

function sanitizeEvent(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    capacity: e.capacity,
    registeredCount: registeredCount(e.id),
  }
}

function listEvents() {
  return [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(sanitizeEvent)
}

function findEvent(id) {
  return events.find((e) => e.id === id) || null
}

// ── API ───────────────────────────────────────────────────────────────────────
const api = {
  async post(url, body, config = {}) {
    if (url === '/auth/register') {
      const { email, password, name } = body || {}
      if (!email || !password) return fail(400, 'email and password required')
      if (users.some((u) => u.email === email)) return fail(409, 'user already exists')
      const user = { id: nextUserId++, email, name: name || email.split('@')[0], password: String(password), is_admin: false }
      users.push(user)
      save()
      return ok({ user: publicUser(user), token: makeToken(user) })
    }

    if (url === '/auth/login') {
      const { email, password } = body || {}
      const user = users.find((u) => u.email === email)
      if (!user || user.password !== String(password)) return fail(401, 'invalid credentials')
      return ok({ user: publicUser(user), token: makeToken(user) })
    }

    if (url === '/events') {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      if (!user.is_admin) return fail(403, 'forbidden — admin only')
      const { title, description, date, capacity } = body || {}
      if (!title || !date) return fail(400, 'title and date required')
      const ev = {
        id: nextEventId++,
        title,
        description: description || '',
        date: new Date(date).toISOString(),
        capacity: Number(capacity ?? 0),
        created_by: user.id,
      }
      events.push(ev)
      save()
      return ok(sanitizeEvent(ev), 201)
    }

    const m = url.match(/^\/events\/(\d+)\/(register|cancel)$/)
    if (m) {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      const id = Number(m[1])
      const ev = findEvent(id)
      if (!ev) return fail(404, 'not found')
      const already = registrations.some((r) => r.event_id === id && r.user_id === user.id)
      if (m[2] === 'register') {
        if (!already) {
          if (registeredCount(id) >= ev.capacity) return fail(400, 'event full')
          registrations.push({ event_id: id, user_id: user.id, created_at: new Date().toISOString() })
        }
      } else {
        registrations = registrations.filter((r) => !(r.event_id === id && r.user_id === user.id))
      }
      save()
      return ok(sanitizeEvent(ev))
    }

    return fail(404, 'not found')
  },

  async get(url, config = {}) {
    if (url === '/auth/me') {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      return ok(publicUser(user))
    }

    if (url === '/events') {
      return ok(listEvents())
    }

    if (url === '/events/my-registrations') {
      const user = authUser(config)
      if (!user) return ok([])
      return ok(registrations.filter((r) => r.user_id === user.id).map((r) => r.event_id))
    }

    if (url === '/events/registrations/all') {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      if (!user.is_admin) return fail(403, 'forbidden — admin only')
      const rows = registrations
        .map((r) => {
          const ev = findEvent(r.event_id)
          const u = users.find((x) => x.id === r.user_id)
          if (!ev || !u) return null
          return {
            event_id: ev.id,
            event_title: ev.title,
            user_id: u.id,
            name: u.name,
            email: u.email,
            registered_at: r.created_at,
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))
      return ok(rows)
    }

    const m = url.match(/^\/events\/(\d+)\/registrations$/)
    if (m) {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      if (!user.is_admin) return fail(403, 'forbidden — admin only')
      const id = Number(m[1])
      const rows = registrations
        .filter((r) => r.event_id === id)
        .map((r) => {
          const u = users.find((x) => x.id === r.user_id)
          return u ? { id: u.id, name: u.name, email: u.email, registered_at: r.created_at } : null
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at))
      return ok(rows)
    }

    if (url === '/events/logs') return ok([])
    if (url === '/events/stats') return ok({})

    return fail(404, 'not found')
  },

  async patch(url, body, config = {}) {
    const m = url.match(/^\/events\/(\d+)$/)
    if (m) {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      if (!user.is_admin) return fail(403, 'forbidden — admin only')
      const id = Number(m[1])
      const ev = findEvent(id)
      if (!ev) return fail(404, 'not found')
      const { title, description, date, capacity } = body || {}
      if (title !== undefined) ev.title = title
      if (description !== undefined) ev.description = description
      if (date !== undefined) ev.date = new Date(date).toISOString()
      if (capacity !== undefined) ev.capacity = Number(capacity)
      save()
      return ok(sanitizeEvent(ev))
    }
    return fail(404, 'not found')
  },

  async delete(url, config = {}) {
    const m = url.match(/^\/events\/(\d+)$/)
    if (m) {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      if (!user.is_admin) return fail(403, 'forbidden — admin only')
      const id = Number(m[1])
      const idx = events.findIndex((e) => e.id === id)
      if (idx === -1) return fail(404, 'not found')
      events.splice(idx, 1)
      registrations = registrations.filter((r) => r.event_id !== id)
      save()
      return ok(null, 204)
    }
    return fail(404, 'not found')
  },
}

export default api

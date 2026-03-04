// Minimal axios-like mock API for local testing
let users = new Map()
let nextUserId = 1

let events = []
let nextEventId = 1

function ok(data) { return Promise.resolve({ data }) }
function fail(status, message) {
  const err = new Error(message || 'Request failed')
  err.response = { status, data: { message } }
  return Promise.reject(err)
}

function sanitizeEvent(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    capacity: e.capacity,
    registeredCount: e.attendees.size,
  }
}

function authUser(config) {
  const h = (config && config.headers && config.headers.Authorization) || ''
  const m = /^Bearer\s+(.+)$/.exec(h)
  if (!m) return null
  const token = m[1]
  if (!token.startsWith('user:')) return null
  const email = token.slice(5)
  const user = users.get(email)
  return user || null
}

const api = {
  async post(url, body, config = {}) {
    if (url === '/auth/register') {
      const { email, password, name } = body || {}
      if (!email || !password) return fail(400, 'email and password required')
      if (users.has(email)) return fail(409, 'user already exists')
      const user = { id: nextUserId++, email, name: name || email.split('@')[0], password }
      users.set(email, user)
      return ok({ user: { id: user.id, email: user.email, name: user.name }, token: `user:${user.email}` })
    }
    if (url === '/auth/login') {
      const { email, password } = body || {}
      const user = users.get(email)
      if (!user || user.password !== password) return fail(401, 'invalid credentials')
      return ok({ user: { id: user.id, email: user.email, name: user.name }, token: `user:${user.email}` })
    }
    if (url === '/events') {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      const { title, description, date, capacity } = body || {}
      if (!title || !date) return fail(400, 'title and date required')
      const ev = { id: nextEventId++, title, description: description || '', date: new Date(date).toISOString(), capacity: Number(capacity ?? 0), attendees: new Set() }
      events.unshift(ev)
      return ok(sanitizeEvent(ev))
    }
    const m = url.match(/^\/events\/(\d+)\/(register|cancel)$/)
    if (m) {
      const id = Number(m[1])
      const action = m[2]
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      const ev = events.find((e) => e.id === id)
      if (!ev) return fail(404, 'not found')
      if (action === 'register') {
        if (ev.attendees.has(user.email)) return fail(409, 'already registered')
        if (ev.attendees.size >= ev.capacity) return fail(400, 'event full')
        ev.attendees.add(user.email)
      } else {
        ev.attendees.delete(user.email)
      }
      return ok(sanitizeEvent(ev))
    }
    return fail(404, 'not found')
  },
  async get(url) {
    if (url === '/events') {
      return ok(events.map(sanitizeEvent))
    }
    return fail(404, 'not found')
  },
  async patch(url, body, config = {}) {
    const m = url.match(/^\/events\/(\d+)$/)
    if (m) {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      const id = Number(m[1])
      const ev = events.find((e) => e.id === id)
      if (!ev) return fail(404, 'not found')
      const { title, description, date, capacity } = body || {}
      if (title !== undefined) ev.title = title
      if (description !== undefined) ev.description = description
      if (date !== undefined) ev.date = new Date(date).toISOString()
      if (capacity !== undefined) ev.capacity = Number(capacity)
      return ok(sanitizeEvent(ev))
    }
    return fail(404, 'not found')
  },
  async delete(url, config = {}) {
    const m = url.match(/^\/events\/(\d+)$/)
    if (m) {
      const user = authUser(config)
      if (!user) return fail(401, 'unauthorized')
      const id = Number(m[1])
      const idx = events.findIndex((e) => e.id === id)
      if (idx === -1) return fail(404, 'not found')
      events.splice(idx, 1)
      return ok(null)
    }
    return fail(404, 'not found')
  },
}

export default api


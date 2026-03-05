import { defineStore } from 'pinia'
import api from '../services/api.js'

export const useEventsStore = defineStore('events', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    realtime: { source: null, intervalId: null },
    myRegistrationIds: [],   // event IDs the current user is registered to
    allRegistrations: [],    // admin: all registrations across all events
    registrationsLoading: false,
  }),
  getters: {
    byId: (s) => (id) => s.items.find((e) => e.id === id),
    isRegistered: (s) => (eventId) => s.myRegistrationIds.includes(eventId),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/events')
        this.items = Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e?.response?.data?.message || 'Failed to fetch events'
      } finally {
        this.loading = false
      }
    },
    async fetchMyRegistrations() {
      try {
        const { data } = await api.get('/events/my-registrations')
        this.myRegistrationIds = Array.isArray(data) ? data : []
      } catch {
        this.myRegistrationIds = []
      }
    },
    async fetchAllRegistrations() {
      this.registrationsLoading = true
      try {
        const { data } = await api.get('/events/registrations/all')
        this.allRegistrations = Array.isArray(data) ? data : []
      } catch {
        this.allRegistrations = []
      } finally {
        this.registrationsLoading = false
      }
    },
    async create(event) {
      const { data } = await api.post('/events', event)
      this.items.unshift(data)
      return data
    },
    async update(id, patch) {
      const { data } = await api.patch(`/events/${id}`, patch)
      const idx = this.items.findIndex((e) => e.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },
    async remove(id) {
      await api.delete(`/events/${id}`)
      this.items = this.items.filter((e) => e.id !== id)
    },
    async register(id) {
      const { data } = await api.post(`/events/${id}/register`)
      const idx = this.items.findIndex((e) => e.id === id)
      if (idx !== -1) this.items[idx] = data
      if (!this.myRegistrationIds.includes(id)) this.myRegistrationIds.push(id)
      return data
    },
    async cancelRegistration(id) {
      const { data } = await api.post(`/events/${id}/cancel`)
      const idx = this.items.findIndex((e) => e.id === id)
      if (idx !== -1) this.items[idx] = data
      this.myRegistrationIds = this.myRegistrationIds.filter((eid) => eid !== id)
      return data
    },
    startRealtime() {
      const useMock = (import.meta.env.VITE_USE_MOCK === '1')
      this.stopRealtime()
      if (!useMock) {
        try {
          const source = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/events/stream`)
          source.onmessage = (ev) => {
            try {
              const payload = JSON.parse(ev.data)
              if (Array.isArray(payload)) this.items = payload
            } catch {}
          }
          source.onerror = () => { source.close() }
          this.realtime.source = source
        } catch {
          // ignore
        }
      }
      if (useMock || !this.realtime.source) {
        const intervalId = setInterval(() => { this.fetchAll() }, 5000)
        this.realtime.intervalId = intervalId
      }
    },
    stopRealtime() {
      if (this.realtime.source) {
        this.realtime.source.close()
        this.realtime.source = null
      }
      if (this.realtime.intervalId) {
        clearInterval(this.realtime.intervalId)
        this.realtime.intervalId = null
      }
    },
  },
})

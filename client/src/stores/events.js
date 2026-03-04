import { defineStore } from 'pinia'
import api from '../services/api.js'

export const useEventsStore = defineStore('events', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    realtime: { source: null, intervalId: null },
  }),
  getters: {
    byId: (s) => (id) => s.items.find((e) => e.id === id),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        // Expect backend: GET /events -> [{...}]
        const { data } = await api.get('/events')
        this.items = Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e?.response?.data?.message || 'Failed to fetch events'
      } finally {
        this.loading = false
      }
    },
    async create(event) {
      // Expect backend: POST /events -> created event
      const { data } = await api.post('/events', event)
      this.items.unshift(data)
      return data
    },
    async update(id, patch) {
      // Expect backend: PATCH /events/:id -> updated event
      const { data } = await api.patch(`/events/${id}`, patch)
      const idx = this.items.findIndex((e) => e.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },
    async remove(id) {
      // Expect backend: DELETE /events/:id
      await api.delete(`/events/${id}`)
      this.items = this.items.filter((e) => e.id !== id)
    },
    async register(id) {
      // Expect backend: POST /events/:id/register -> updated event
      const { data } = await api.post(`/events/${id}/register`)
      const idx = this.items.findIndex((e) => e.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },
    async cancelRegistration(id) {
      // Expect backend: POST /events/:id/cancel -> updated event
      const { data } = await api.post(`/events/${id}/cancel`)
      const idx = this.items.findIndex((e) => e.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },
    startRealtime() {
      const useMock = (import.meta.env.VITE_USE_MOCK === '1')
      // In mock mode, skip SSE and poll
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
          source.onerror = () => {
            source.close()
          }
          this.realtime.source = source
        } catch {
          // ignore
        }
      }
      if (useMock || !this.realtime.source) {
        const intervalId = setInterval(() => {
          this.fetchAll()
        }, 5000)
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

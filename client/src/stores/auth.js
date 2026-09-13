import { defineStore } from 'pinia'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    isAdmin: (s) => s.user?.is_admin === true,
  },
  actions: {
    hydrate() {
      let raw = null
      try { raw = localStorage.getItem('auth') } catch {}
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        this.user = parsed.user
        this.token = parsed.token
      } catch {
        this.logout()
        return
      }
      // Vérifie que la session est encore valide côté API et rafraîchit le rôle
      if (this.token) {
        api.get('/auth/me')
          .then(({ data }) => {
            if (data && data.id) {
              this.user = { ...this.user, ...data }
              this.persist()
            }
          })
          .catch((e) => {
            if (e?.response?.status === 401) this.logout()
          })
      }
    },
    persist() {
      localStorage.setItem('auth', JSON.stringify({ user: this.user, token: this.token }))
    },
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/login', credentials)
        this.user = data.user
        this.token = data.token
        this.persist()
        return true
      } catch (e) {
        this.error = e?.response?.data?.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },
    async register(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/register', payload)
        this.user = data.user
        this.token = data.token
        this.persist()
        return true
      } catch (e) {
        this.error = e?.response?.data?.message || 'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth')
    },
  },
})

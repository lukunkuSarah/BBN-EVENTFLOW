import axios from 'axios'
import { useAuthStore } from '../stores/auth.js'
import mock from './mock.js'

const useMock = (import.meta.env.VITE_USE_MOCK === '1')

let api
if (useMock) {
  const withAuth = (config = {}) => {
    try {
      const auth = useAuthStore()
      if (auth?.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${auth.token}`
      }
    } catch {}
    return config
  }
  api = {
    get: (url, config) => mock.get(url, withAuth(config)),
    post: (url, data, config) => mock.post(url, data, withAuth(config)),
    patch: (url, data, config) => mock.patch(url, data, withAuth(config)),
    delete: (url, config) => mock.delete(url, withAuth(config)),
  }
} else {
  api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
  })

  api.interceptors.request.use((config) => {
    try {
      const auth = useAuthStore()
      if (auth?.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${auth.token}`
      }
    } catch {}
    return config
  })
}

export default api

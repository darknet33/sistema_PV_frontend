import axios from 'axios'
import { isTokenExpired } from '../stores/authStore'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token')
      window.location.href = '/session-expired'
      return Promise.reject(new Error('Token expirado'))
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token')
      window.location.href = '/session-expired'
    }
    return Promise.reject(error)
  }
)

export default api

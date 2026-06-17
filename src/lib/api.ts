import axios from 'axios'
import { toast } from 'sonner'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geekink-cloud-sp39l.ondigitalocean.app/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network / CORS / timeout — no HTTP response received
      toast.error('Connection error. Please try again.')
      return Promise.reject(error)
    }

    const status = error.response?.status

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        // Expire auth cookies so middleware redirects correctly
        document.cookie = 'accessToken=; path=/; max-age=0'
        document.cookie = 'role=; path=/; max-age=0'
        window.location.href = '/login'
      }
    }
    // 403 — do not redirect; let each page handle with its own message

    return Promise.reject(error)
  }
)

// Unwraps a list response that may be a raw array or a paginated/enveloped { data: [...] } shape.
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data
  }
  return []
}

// Unwraps a single-object response that may be raw or enveloped as { data: {...} }.
export function unwrapOne<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data
  }
  return data as T
}

export { api }
export default api

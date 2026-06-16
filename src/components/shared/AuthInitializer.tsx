'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export function AuthInitializer() {
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')

    if (!token) return

    // Optimistically restore from localStorage
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setAuth(user, token)
      } catch {
        // ignore parse error
      }
    }

    // Validate token with server
    api.get('/auth/me')
      .then((res) => {
        setAuth(res.data, token)
      })
      .catch(() => {
        clearAuth()
      })
  }, [setAuth, clearAuth])

  return null
}

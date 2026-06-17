import { create } from 'zustand'
import type { SafeUser } from '@/types'

interface AuthState {
  user: SafeUser | null
  accessToken: string | null
  setAuth: (user: SafeUser, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    }
    set({ user, accessToken })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      // Expire middleware cookies
      document.cookie = 'accessToken=; path=/; max-age=0'
      document.cookie = 'role=; path=/; max-age=0'
    }
    set({ user: null, accessToken: null })
  },
}))

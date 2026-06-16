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
    }
    set({ user: null, accessToken: null })
  },
}))

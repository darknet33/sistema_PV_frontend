import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginRequest, LoginResponse, SetupAdminRequest, Usuario } from '../types/auth'
import { login, setupAdmin } from '../services/authService'

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  setupAdmin: (data: SetupAdminRequest) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      login: async (data: LoginRequest) => {
        const response: LoginResponse = await login(data)
        localStorage.setItem('token', response.access_token)
        set({ token: response.access_token, isAuthenticated: true })
      },
      setupAdmin: async (data: SetupAdminRequest) => {
        const response: LoginResponse = await setupAdmin(data)
        localStorage.setItem('token', response.access_token)
        set({ token: response.access_token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, usuario: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

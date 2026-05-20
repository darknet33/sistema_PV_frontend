import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginRequest, LoginResponse, SetupAdminRequest, ModuloAsignado, Usuario } from '../types/auth'
import { login, setupAdmin } from '../services/authService'

function parseJwt(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true
  return Date.now() >= payload.exp * 1000
}

interface AuthState {
  token: string | null
  usuario: Usuario | null
  modulos: ModuloAsignado[]
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  setupAdmin: (data: SetupAdminRequest) => Promise<void>
  logout: () => void
  checkAndLogoutIfExpired: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      modulos: [],
      isAuthenticated: false,
      login: async (data: LoginRequest) => {
        const response: LoginResponse = await login(data)
        localStorage.setItem('token', response.access_token)
        set({
          token: response.access_token,
          usuario: response.usuario,
          modulos: response.modulos,
          isAuthenticated: true,
        })
      },
      setupAdmin: async (data: SetupAdminRequest) => {
        const response: LoginResponse = await setupAdmin(data)
        localStorage.setItem('token', response.access_token)
        set({
          token: response.access_token,
          usuario: response.usuario,
          modulos: response.modulos,
          isAuthenticated: true,
        })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, usuario: null, modulos: [], isAuthenticated: false })
      },
      checkAndLogoutIfExpired: () => {
        const { token, logout } = get()
        if (token && isTokenExpired(token)) {
          logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        usuario: state.usuario,
        modulos: state.modulos,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && isTokenExpired(state.token)) {
          localStorage.removeItem('token')
          state.token = null
          state.usuario = null
          state.modulos = []
          state.isAuthenticated = false
        }
      },
    }
  )
)

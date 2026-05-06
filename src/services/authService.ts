import api from './api'
import type { CheckUsersResponse, LoginRequest, LoginResponse, SetupAdminRequest } from '../types/auth'

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data)
  return response.data
}

export const checkUsers = async (): Promise<CheckUsersResponse> => {
  const response = await api.get<CheckUsersResponse>('/auth/check-users')
  return response.data
}

export const setupAdmin = async (data: SetupAdminRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/setup-admin', data)
  return response.data
}

import api from './api'
import type { Empresa, EmpresaUpdate } from '../types/empresa'

export const getEmpresa = async (): Promise<Empresa> => {
  const response = await api.get<Empresa>('/empresa/')
  return response.data
}

export const updateEmpresa = async (data: EmpresaUpdate): Promise<Empresa> => {
  const response = await api.put<Empresa>('/empresa/', data)
  return response.data
}

export const uploadEmpresaLogo = async (file: File): Promise<{ logo: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ logo: string }>('/empresa/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteEmpresaLogo = async (): Promise<{ message: string; logo: null }> => {
  const response = await api.delete<{ message: string; logo: null }>('/empresa/logo')
  return response.data
}

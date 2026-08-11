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

export const uploadEmpresaImagenEncabezado = async (file: File): Promise<{ imagen_encabezado: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ imagen_encabezado: string }>('/empresa/imagen-encabezado', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteEmpresaImagenEncabezado = async (): Promise<{ message: string; imagen_encabezado: null }> => {
  const response = await api.delete<{ message: string; imagen_encabezado: null }>('/empresa/imagen-encabezado')
  return response.data
}

export const uploadEmpresaImagenPie = async (file: File): Promise<{ imagen_pie: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ imagen_pie: string }>('/empresa/imagen-pie', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteEmpresaImagenPie = async (): Promise<{ message: string; imagen_pie: null }> => {
  const response = await api.delete<{ message: string; imagen_pie: null }>('/empresa/imagen-pie')
  return response.data
}

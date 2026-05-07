import api from './api'
import type { Proveedor } from '../types/proveedor'

export const getProveedores = async (): Promise<Proveedor[]> => {
  const response = await api.get<Proveedor[]>('/proveedores/')
  return response.data
}

export const createProveedor = async (data: Omit<Proveedor, 'id' | 'activo' | 'fecha_registro'>): Promise<Proveedor> => {
  const response = await api.post<Proveedor>('/proveedores/', data)
  return response.data
}

export const deleteProveedor = async (id: number): Promise<void> => {
  await api.delete(`/proveedores/${id}`)
}

export const updateProveedor = async (id: number, data: Omit<Proveedor, 'id' | 'activo' | 'fecha_registro'>): Promise<Proveedor> => {
  const response = await api.put<Proveedor>(`/proveedores/${id}`, data)
  return response.data
}

export const toggleProveedorActivo = async (id: number): Promise<Proveedor> => {
  const response = await api.patch<Proveedor>(`/proveedores/${id}/toggle-activo`)
  return response.data
}

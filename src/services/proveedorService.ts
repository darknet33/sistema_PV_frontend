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

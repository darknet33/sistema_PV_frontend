import api from './api'
import type { Venta, VentaCreate } from '../types/venta'

export const getVentas = async (): Promise<Venta[]> => {
  const response = await api.get<Venta[]>('/ventas/')
  return response.data
}

export const getVenta = async (id: number): Promise<Venta> => {
  const response = await api.get<Venta>(`/ventas/${id}`)
  return response.data
}

export const createVenta = async (data: VentaCreate): Promise<Venta> => {
  const response = await api.post<Venta>('/ventas/', data)
  return response.data
}

export const updateVenta = async (id: number, data: VentaCreate): Promise<Venta> => {
  const response = await api.put<Venta>(`/ventas/${id}`, data)
  return response.data
}

export const deleteVenta = async (id: number): Promise<void> => {
  await api.delete(`/ventas/${id}`)
}

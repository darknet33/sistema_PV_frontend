import api from './api'
import type { Compra, CompraCreate } from '../types/compra'

export const getCompras = async (): Promise<Compra[]> => {
  const response = await api.get<Compra[]>('/compras/')
  return response.data
}

export const getCompra = async (id: number): Promise<Compra> => {
  const response = await api.get<Compra>(`/compras/${id}`)
  return response.data
}

export const createCompra = async (data: CompraCreate): Promise<Compra> => {
  const response = await api.post<Compra>('/compras/', data)
  return response.data
}

export const updateCompra = async (id: number, data: CompraCreate): Promise<Compra> => {
  const response = await api.put<Compra>(`/compras/${id}`, data)
  return response.data
}

export const deleteCompra = async (id: number): Promise<void> => {
  await api.delete(`/compras/${id}`)
}

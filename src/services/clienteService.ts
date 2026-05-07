import api from './api'
import type { Cliente } from '../types/cliente'

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await api.get<Cliente[]>('/clientes/')
  return response.data
}

export const createCliente = async (data: Omit<Cliente, 'id' | 'activo' | 'fecha_registro'>): Promise<Cliente> => {
  const response = await api.post<Cliente>('/clientes/', data)
  return response.data
}

export const deleteCliente = async (id: number): Promise<void> => {
  await api.delete(`/clientes/${id}`)
}

export const updateCliente = async (id: number, data: Omit<Cliente, 'id' | 'activo' | 'fecha_registro'>): Promise<Cliente> => {
  const response = await api.put<Cliente>(`/clientes/${id}`, data)
  return response.data
}

export const toggleClienteActivo = async (id: number): Promise<Cliente> => {
  const response = await api.patch<Cliente>(`/clientes/${id}/toggle-activo`)
  return response.data
}

import api from './api'
import type { Estado, EstadoCreate } from '../types/configuracion'

const estadoService = {
  getAll: async () => {
    const { data } = await api.get<Estado[]>('/estados/')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<Estado>(`/estados/${id}`)
    return data
  },
  create: async (estado: EstadoCreate) => {
    const { data } = await api.post<Estado>('/estados/', estado)
    return data
  },
  update: async (id: number, estado: EstadoCreate) => {
    const { data } = await api.put<Estado>(`/estados/${id}`, estado)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/estados/${id}`)
    return data
  },
}

export default estadoService

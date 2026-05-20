import api from './api'
import type { Modulo, ModuloCreate } from '../types/configuracion'

const moduloService = {
  getAll: async () => {
    const { data } = await api.get<Modulo[]>('/modulos/')
    return data
  },
  getAllFromConfig: async () => {
    const { data } = await api.get<Modulo[]>('/configuracion/modulos')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<Modulo>(`/modulos/${id}`)
    return data
  },
  create: async (modulo: ModuloCreate) => {
    const { data } = await api.post<Modulo>('/modulos/', modulo)
    return data
  },
  update: async (id: number, modulo: ModuloCreate) => {
    const { data } = await api.put<Modulo>(`/modulos/${id}`, modulo)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/modulos/${id}`)
    return data
  },
}

export default moduloService

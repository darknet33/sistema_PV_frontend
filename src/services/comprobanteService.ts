import api from './api'

export interface Comprobante {
  id: number
  nombre: string
  numero: number
}

export interface ComprobanteCreate {
  nombre: string
  numero: number
}

const comprobanteService = {
  getAll: async () => {
    const { data } = await api.get<Comprobante[]>('/comprobantes/')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<Comprobante>(`/comprobantes/${id}`)
    return data
  },
  create: async (comprobante: ComprobanteCreate) => {
    const { data } = await api.post<Comprobante>('/comprobantes/', comprobante)
    return data
  },
  update: async (id: number, comprobante: ComprobanteCreate) => {
    const { data } = await api.put<Comprobante>(`/comprobantes/${id}`, comprobante)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/comprobantes/${id}`)
    return data
  },
}

export default comprobanteService

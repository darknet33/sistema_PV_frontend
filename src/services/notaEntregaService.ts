import api from './api'
import type { NotaEntrega, NotaEntregaCreate } from '../types/notaEntrega'

export const getNotasEntrega = async (ventaId?: number): Promise<NotaEntrega[]> => {
  const response = await api.get<NotaEntrega[]>('/notas-entrega/', {
    params: ventaId ? { venta_id: ventaId } : undefined,
  })
  return response.data
}

export const createNotaEntrega = async (data: NotaEntregaCreate): Promise<NotaEntrega> => {
  const response = await api.post<NotaEntrega>('/notas-entrega/', data)
  return response.data
}

export const deleteNotaEntrega = async (id: number): Promise<void> => {
  await api.delete(`/notas-entrega/${id}`)
}

export const fetchNotaEntregaPdfBlob = async (id: number): Promise<Blob> => {
  const response = await api.get(`/notas-entrega/${id}/pdf`, { responseType: 'blob' })
  return response.data
}

export const downloadNotaEntregaPdf = async (id: number) => {
  const response = await api.get(`/notas-entrega/${id}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `nota_entrega_${id}.pdf`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

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

export const anularVenta = async (id: number): Promise<Venta> => {
  const response = await api.put<Venta>(`/ventas/${id}/anular`)
  return response.data
}

export const deleteVenta = async (id: number): Promise<void> => {
  await api.delete(`/ventas/${id}`)
}

export const downloadVentaPdf = async (id: number) => {
  const response = await api.get(`/ventas/${id}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `venta_${id}.pdf`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const downloadVentaReport = async (
  fechaInicio: string,
  fechaFin: string,
  clienteText?: string,
  estadoId?: number
) => {
  const params: any = { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  if (clienteText) params.cliente_text = clienteText
  if (estadoId) params.estado_id = estadoId
  const response = await api.get('/reportes/ventas/pdf', { params, responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'reporte_ventas.pdf')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

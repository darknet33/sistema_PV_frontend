import api from './api'
import type { Compra, CompraCreate, CompraUpdate } from '../types/compra'

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

export const updateCompra = async (id: number, data: CompraUpdate): Promise<Compra> => {
  const response = await api.put<Compra>(`/compras/${id}`, data)
  return response.data
}

export const deleteCompra = async (id: number): Promise<void> => {
  await api.delete(`/compras/${id}`)
}

export const downloadCompraReport = async (fechaInicio: string, fechaFin: string, proveedorText?: string, estadoId?: number): Promise<void> => {
  const params: any = { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  if (proveedorText) params.proveedor_text = proveedorText
  if (estadoId) params.estado_id = estadoId
  const response = await api.get('/reportes/compras/pdf', {
    params,
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'reporte_compras.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const downloadCompraPdf = async (id: number): Promise<void> => {
  const response = await api.get(`/compras/${id}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `compra_${id}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

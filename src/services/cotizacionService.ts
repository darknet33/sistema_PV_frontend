import api from './api'
import type { Cotizacion, CotizacionCreate, CotizacionUpdate, ConvertirVentaRequest } from '../types/cotizacion'
import type { Venta } from '../types/venta'

export const getCotizaciones = async (): Promise<Cotizacion[]> => {
  const response = await api.get<Cotizacion[]>('/cotizaciones/')
  return response.data
}

export const getCotizacion = async (id: number): Promise<Cotizacion> => {
  const response = await api.get<Cotizacion>(`/cotizaciones/${id}`)
  return response.data
}

export const createCotizacion = async (data: CotizacionCreate): Promise<Cotizacion> => {
  const response = await api.post<Cotizacion>('/cotizaciones/', data)
  return response.data
}

export const updateCotizacion = async (id: number, data: CotizacionUpdate): Promise<Cotizacion> => {
  const response = await api.put<Cotizacion>(`/cotizaciones/${id}`, data)
  return response.data
}

export const confirmarCotizacion = async (id: number): Promise<Cotizacion> => {
  const response = await api.put<Cotizacion>(`/cotizaciones/${id}/confirmar`)
  return response.data
}

export const deleteCotizacion = async (id: number): Promise<Cotizacion> => {
  const response = await api.delete<Cotizacion>(`/cotizaciones/${id}`)
  return response.data
}

export const convertirCotizacionEnVenta = async (id: number, data: ConvertirVentaRequest): Promise<Venta> => {
  const response = await api.post<Venta>(`/cotizaciones/${id}/convertir-venta`, data)
  return response.data
}

export const downloadCotizacionPdf = async (id: number) => {
  const response = await api.get(`/cotizaciones/${id}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `cotizacion_${id}.pdf`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const previewCotizacionPdf = async (id: number) => {
  const response = await api.get(`/cotizaciones/${id}/pdf/preview`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  window.open(url, '_blank')
}

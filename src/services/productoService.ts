import api from './api'
import type { Producto, ProductoCreate, ProductoUpdate } from '../types/producto'

export const getProductos = async (): Promise<Producto[]> => {
  const response = await api.get<Producto[]>('/productos/')
  return response.data
}

export const getProducto = async (id: number): Promise<Producto> => {
  const response = await api.get<Producto>(`/productos/${id}`)
  return response.data
}

export const createProducto = async (data: ProductoCreate): Promise<Producto> => {
  const response = await api.post<Producto>('/productos/', data)
  return response.data
}

export const updateProducto = async (id: number, data: ProductoUpdate): Promise<Producto> => {
  const response = await api.put<Producto>(`/productos/${id}`, data)
  return response.data
}

export const deleteProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`)
}

export const toggleProductoActivo = async (id: number): Promise<Producto> => {
  const response = await api.patch<Producto>(`/productos/${id}/toggle-activo`)
  return response.data
}

export const exportProductos = async (): Promise<Blob> => {
  const response = await api.get('/productos/export-xlsx', { responseType: 'blob' })
  return response.data
}

export const importProductos = async (file: File): Promise<{ creados: number; actualizados: number; errores: string[]; procesados: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/productos/import-xlsx', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteProductosBatch = async (ids: number[]): Promise<{ message: string; count: number }> => {
  const response = await api.post('/productos/delete-batch', ids)
  return response.data
}

export const deleteAllProductos = async (): Promise<{ message: string; count: number }> => {
  const response = await api.delete('/productos/all')
  return response.data
}

export const uploadProductoImagen = async (id: number, file: File): Promise<{ imagen: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/productos/${id}/imagen`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteProductoImagen = async (id: number): Promise<{ message: string; imagen: null }> => {
  const response = await api.delete(`/productos/${id}/imagen`)
  return response.data
}

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

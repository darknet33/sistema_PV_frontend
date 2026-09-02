import api from './api'
import type { CategoriaUnidad, CategoriaUnidadCreate } from '../types/categoriaUnidad'

const categoriaUnidadService = {
  getAll: async (): Promise<CategoriaUnidad[]> => {
    const { data } = await api.get<CategoriaUnidad[]>('/categorias-unidad/')
    return data
  },
  create: async (cat: CategoriaUnidadCreate): Promise<CategoriaUnidad> => {
    const { data } = await api.post<CategoriaUnidad>('/categorias-unidad/', cat)
    return data
  },
  update: async (id: number, cat: CategoriaUnidadCreate): Promise<CategoriaUnidad> => {
    const { data } = await api.put<CategoriaUnidad>(`/categorias-unidad/${id}`, cat)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/categorias-unidad/${id}`)
    return data
  },
  deleteAll: async () => {
    const { data } = await api.delete('/categorias-unidad/all')
    return data
  },
}

export default categoriaUnidadService

import api from './api'
import type { Categoria, CategoriaCreate } from '../types/categoria'

const categoriaService = {
  getAll: async () => {
    const { data } = await api.get<Categoria[]>('/categorias/')
    return data
  },
  create: async (categoria: CategoriaCreate) => {
    const { data } = await api.post<Categoria>('/categorias/', categoria)
    return data
  },
  update: async (id: number, categoria: CategoriaCreate) => {
    const { data } = await api.put<Categoria>(`/categorias/${id}`, categoria)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/categorias/${id}`)
    return data
  },
  deleteAll: async (): Promise<{ message: string; eliminadas: number; omitidas: string[] }> => {
    const { data } = await api.delete('/categorias/all')
    return data
  },
}

export default categoriaService

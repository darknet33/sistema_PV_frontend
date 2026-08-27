import api from './api'
import type { UnidadMedida, UnidadMedidaCreate } from '../types/unidadMedida'

const unidadMedidaService = {
  getAll: async (categoriaId?: number): Promise<UnidadMedida[]> => {
    const params = categoriaId ? { categoria_id: categoriaId } : {}
    const { data } = await api.get<UnidadMedida[]>('/unidades-medida/', { params })
    return data
  },
  create: async (unidad: UnidadMedidaCreate): Promise<UnidadMedida> => {
    const { data } = await api.post<UnidadMedida>('/unidades-medida/', unidad)
    return data
  },
  update: async (id: number, unidad: UnidadMedidaCreate): Promise<UnidadMedida> => {
    const { data } = await api.put<UnidadMedida>(`/unidades-medida/${id}`, unidad)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/unidades-medida/${id}`)
    return data
  },
  deleteAll: async () => {
    const { data } = await api.delete('/unidades-medida/all')
    return data
  },
}

export default unidadMedidaService

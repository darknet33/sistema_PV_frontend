import api from './api'
import type { Gasto, GastoCreate, GastoUpdate, CategoriaGasto, CategoriaGastoCreate } from '../types/gasto'

export const getGastos = async (): Promise<Gasto[]> => {
  const response = await api.get<Gasto[]>('/gastos/')
  return response.data
}

export const getGasto = async (id: number): Promise<Gasto> => {
  const response = await api.get<Gasto>(`/gastos/${id}`)
  return response.data
}

export const createGasto = async (data: GastoCreate): Promise<Gasto> => {
  const response = await api.post<Gasto>('/gastos/', data)
  return response.data
}

export const updateGasto = async (id: number, data: GastoUpdate): Promise<Gasto> => {
  const response = await api.put<Gasto>(`/gastos/${id}`, data)
  return response.data
}

export const anularGasto = async (id: number): Promise<Gasto> => {
  const response = await api.put<Gasto>(`/gastos/${id}/anular`)
  return response.data
}

export const deleteGasto = async (id: number): Promise<void> => {
  await api.delete(`/gastos/${id}`)
}

export const fetchGastoReportBlob = async (
  fechaInicio: string,
  fechaFin: string,
  categoriaId?: number,
  estadoId?: number
): Promise<Blob> => {
  const params: any = { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  if (categoriaId) params.categoria_id = categoriaId
  if (estadoId) params.estado_id = estadoId
  const response = await api.get('/reportes/gastos/pdf', { params, responseType: 'blob' })
  return response.data
}

const categoriaGastoService = {
  getAll: async () => {
    const { data } = await api.get<CategoriaGasto[]>('/categorias-gastos/')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<CategoriaGasto>(`/categorias-gastos/${id}`)
    return data
  },
  create: async (categoria: CategoriaGastoCreate) => {
    const { data } = await api.post<CategoriaGasto>('/categorias-gastos/', categoria)
    return data
  },
  update: async (id: number, categoria: CategoriaGastoCreate) => {
    const { data } = await api.put<CategoriaGasto>(`/categorias-gastos/${id}`, categoria)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/categorias-gastos/${id}`)
    return data
  },
}

export default categoriaGastoService

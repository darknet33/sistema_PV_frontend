import api from './api'

export interface Rol {
  id: number
  nombre: string
}

export interface RolCreate {
  nombre: string
}

const rolService = {
  getAll: async () => {
    const { data } = await api.get<Rol[]>('/roles/')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<Rol>(`/roles/${id}`)
    return data
  },
  create: async (rol: RolCreate) => {
    const { data } = await api.post<Rol>('/roles/', rol)
    return data
  },
  update: async (id: number, rol: RolCreate) => {
    const { data } = await api.put<Rol>(`/roles/${id}`, rol)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/roles/${id}`)
    return data
  },
  getModulosByRol: async (rolId: number) => {
    const { data } = await api.get<{ rol_id: number; modulo_id: number }[]>(`/configuracion/roles/${rolId}/modulos`)
    return data
  },
  asignarModulos: async (rolId: number, moduloIds: number[]) => {
    const { data } = await api.put(`/configuracion/roles/${rolId}/modulos`, { modulo_ids: moduloIds })
    return data
  },
  agregarModulo: async (rolId: number, moduloId: number) => {
    const { data } = await api.post(`/configuracion/roles/${rolId}/modulos/${moduloId}`)
    return data
  },
  quitarModulo: async (rolId: number, moduloId: number) => {
    const { data } = await api.delete(`/configuracion/roles/${rolId}/modulos/${moduloId}`)
    return data
  },
}

export default rolService

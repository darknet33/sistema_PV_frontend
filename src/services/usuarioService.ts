import api from './api'

export interface Usuario {
  id: number
  username: string
  nombres: string
  apellidos: string
  cargo: string
  rol_id: number
  activo: boolean
  fecha_registro: string
  fecha_actualizado: string
}

export interface UsuarioCreate {
  username: string
  nombres: string
  apellidos: string
  cargo: string
  rol_id: number
  password: string
}

const usuarioService = {
  getAll: async () => {
    const { data } = await api.get<Usuario[]>('/usuarios/')
    return data
  },
  getById: async (id: number) => {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`)
    return data
  },
  create: async (usuario: UsuarioCreate) => {
    const { data } = await api.post<Usuario>('/usuarios/', usuario)
    return data
  },
  update: async (id: number, usuario: UsuarioCreate) => {
    const { data } = await api.put<Usuario>(`/usuarios/${id}`, usuario)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/usuarios/${id}`)
    return data
  },
}

export default usuarioService

import api from './api'
import type { Usuario, UsuarioCreate, UsuarioUpdate, PasswordChange } from '../types/configuracion'

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
  update: async (id: number, usuario: UsuarioUpdate) => {
    const { data } = await api.put<Usuario>(`/usuarios/${id}`, usuario)
    return data
  },
  changePassword: async (id: number, payload: PasswordChange) => {
    const { data } = await api.put(`/usuarios/${id}/password`, payload)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/usuarios/${id}`)
    return data
  },
}

export default usuarioService

export interface LoginRequest {
  username: string
  password: string
}

export interface SetupAdminRequest {
  username: string
  password: string
  nombres: string
  apellidos: string
}

export interface ModuloAsignado {
  id: number
  nombre: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  usuario: Usuario
  modulos: ModuloAsignado[]
}

export interface CheckUsersResponse {
  has_users: boolean
  needs_setup: boolean
}

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

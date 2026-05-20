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

export interface Rol {
  id: number
  nombre: string
}

export interface RolCreate {
  nombre: string
}

export interface Modulo {
  id: number
  nombre: string
  activo: boolean
}

export interface ModuloCreate {
  nombre: string
  activo: boolean
}

export interface Comprobante {
  id: number
  nombre: string
  numero: number
}

export interface ComprobanteCreate {
  nombre: string
  numero: number
}

export interface Estado {
  id: number
  nombre: string
}

export interface EstadoCreate {
  nombre: string
}

export interface RolModuloAssignment {
  rol_id: number
  modulo_id: number
}

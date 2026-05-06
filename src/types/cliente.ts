export interface Cliente {
  id: number
  nombre: string
  nit: string
  celular: string
  direccion: string
  activo: boolean
  fecha_registro: string
}

export interface ClienteCreate {
  nombre: string
  nit: string
  celular: string
  direccion: string
}

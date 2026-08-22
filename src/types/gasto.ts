export interface CategoriaGasto {
  id: number
  nombre: string
  activo: boolean
  fecha_registro: string
}

export interface CategoriaGastoCreate {
  nombre: string
}

export interface GastoCreate {
  fecha: string
  categoria_gasto_id: number
  descripcion?: string
  monto: number
  estado_id: number
}

export interface GastoUpdate {
  fecha?: string
  categoria_gasto_id?: number
  descripcion?: string
  monto?: number
  estado_id?: number
}

export interface Gasto {
  id: number
  fecha: string
  categoria_gasto_id: number
  categoria_nombre: string
  descripcion?: string
  monto: number
  estado_id: number
  estado_nombre: string
  activo: boolean
  usuario_id: number
  usuario_username: string
  fecha_registro: string
}

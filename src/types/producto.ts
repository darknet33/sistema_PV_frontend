export interface Producto {
  id: number
  codigo: string
  categoria_id: number
  descripcion: string
  marca: string
  precio: number
  utilidad: number
  peso: number
  stock_inicial: number
  stock_actual: number
  stock_minimo: number
  usuario_id: number
  activo: boolean
  fecha_registro: string
  fecha_actualizado: string
}

export interface ProductoCreate {
  codigo: string
  categoria_id: number
  descripcion: string
  marca: string
  precio: number
  utilidad?: number
  peso?: number
  stock_inicial: number
  stock_actual: number
  stock_minimo: number
  usuario_id: number
}

export interface ProductoUpdate {
  categoria_id?: number
  descripcion?: string
  marca?: string
  precio?: number
  utilidad?: number
  peso?: number
  stock_minimo?: number
  activo?: boolean
}

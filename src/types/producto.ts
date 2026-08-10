export interface Producto {
  id: number
  codigo: string
  categoria_id: number
  descripcion: string
  marca: string
  procedencia: string
  precio: number
  utilidad: number
  stock_inicial: number
  stock_actual: number
  stock_minimo: number
  stock_maximo: number
  imagen: string | null
  usuario_id: number
  activo: boolean
  fecha_registro: string
  fecha_actualizado: string | null
  usuario_nombre: string
}

export interface ProductoCreate {
  codigo: string
  categoria_id: number
  descripcion: string
  marca: string
  procedencia?: string
  precio: number
  utilidad?: number
  stock_inicial: number
  stock_actual: number
  stock_minimo: number
  stock_maximo?: number
  imagen?: string | null
  usuario_id: number
}

export interface ProductoUpdate {
  categoria_id?: number
  descripcion?: string
  marca?: string
  procedencia?: string
  precio?: number
  utilidad?: number
  stock_minimo?: number
  stock_maximo?: number
  imagen?: string | null
  activo?: boolean
}

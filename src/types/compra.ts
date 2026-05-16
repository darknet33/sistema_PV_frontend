export interface CompraDetalleCreate {
  producto_id: number
  cantidad: number
  costo: number
}

export interface CompraDetalleResponse {
  id: number
  producto_id: number
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  cantidad: number
  costo: number
}

export interface CompraCreate {
  fecha: string
  proveedor_id: number
  comprobante_id: number
  num_comprobante?: string
  estado_id: number
  detalles: CompraDetalleCreate[]
  automatico?: boolean
}

export interface CompraUpdate {
  fecha?: string
  proveedor_id?: number
  comprobante_id?: number
  num_comprobante?: string
  estado_id?: number
  detalles?: CompraDetalleCreate[]
}

export interface Compra {
  id: number
  fecha: string
  proveedor_id: number
  proveedor_nombre: string
  comprobante_id: number
  comprobante_nombre: string
  num_comprobante: string
  estado_id: number
  estado_nombre: string
  total: number
  activo: boolean
  usuario_id: number
  usuario_username: string
  fecha_registro: string
  detalles: CompraDetalleResponse[]
}

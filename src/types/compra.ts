export interface CompraDetalleCreate {
  producto_id: number
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
}

export interface Compra {
  id: number
  fecha: string
  proveedor_id: number
  comprobante_id: number
  num_comprobante: string
  estado_id: number
  total: number
  activo: boolean
  usuario_id: number
  fecha_registro: string
  detalles?: CompraDetalleCreate[]
}

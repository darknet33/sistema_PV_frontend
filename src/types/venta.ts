export interface VentaDetalleCreate {
  producto_id: number
  cantidad: number
  precio: number
  utilidad?: number
}

export interface VentaCreate {
  fecha: string
  cliente_id: number
  comprobante_id: number
  num_comprobante?: string
  estado_id: number
  impuesto?: number
  descuento?: number
  detalles: VentaDetalleCreate[]
}

export interface Venta {
  id: number
  fecha: string
  cliente_id: number
  comprobante_id: number
  num_comprobante: string
  estado_id: number
  total: number
  impuesto: number
  descuento: number
  activo: boolean
  usuario_id: number
  fecha_registro: string
  detalles?: VentaDetalleCreate[]
}

export interface VentaDetalleCreate {
  producto_id: number
  cantidad: number
  precio: number
  utilidad?: number
}

export interface VentaDetalleResponse {
  id: number
  producto_id: number
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  cantidad: number
  precio: number
  utilidad: number
}

export interface VentaCreate {
  fecha: string
  cliente_id: number
  comprobante_id: number
  num_comprobante?: string
  estado_id: number
  impuesto?: number
  descuento?: number
  automatico?: boolean
  detalles: VentaDetalleCreate[]
}

export interface Venta {
  id: number
  fecha: string
  cliente_id: number
  cliente_nombre: string
  comprobante_id: number
  comprobante_nombre: string
  num_comprobante: string
  estado_id: number
  estado_nombre: string
  total: number
  impuesto: number
  descuento: number
  activo: boolean
  usuario_id: number
  usuario_username: string
  fecha_registro: string
  detalles: VentaDetalleResponse[]
}

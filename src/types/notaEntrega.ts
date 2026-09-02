export interface NotaEntregaDetalleCreate {
  producto_id: number
  cantidad: number
}

export interface NotaEntregaDetalleResponse {
  id: number
  producto_id: number
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  cantidad: number
}

export interface NotaEntregaCreate {
  venta_id: number
  entregue_nombre: string
  entregue_carnet: string
  recibi_nombre: string
  recibi_carnet: string
  detalles: NotaEntregaDetalleCreate[]
}

export interface NotaEntrega {
  id: number
  numero: string
  venta_id: number
  fecha: string
  entregue_nombre: string
  entregue_carnet: string
  recibi_nombre: string
  recibi_carnet: string
  usuario_id: number
  usuario_username: string
  activo: boolean
  total_cantidad: number
  fecha_registro: string
  detalles: NotaEntregaDetalleResponse[]
}

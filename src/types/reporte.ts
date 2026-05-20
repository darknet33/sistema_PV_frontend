export interface ResumenVenta {
  venta_id: number
  fecha: string
  num_comprobante: string
  cliente: string
  tipo_comprobante: string
  estado: string
  subtotal: number
  impuesto: number
  descuento: number
  total: number
  utilidad: number
}

export interface ResumenCompra {
  compra_id: number
  fecha: string
  num_comprobante: string
  proveedor: string
  tipo_comprobante: string
  estado: string
  total: number
}

export interface TopProducto {
  id: number
  codigo: string
  descripcion: string
  total_vendido: number
}

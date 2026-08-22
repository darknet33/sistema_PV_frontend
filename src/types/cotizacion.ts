export interface CotizacionDetalleCreate {
  producto_id: number
  cantidad: number
  costo: number
  utilidad_pct: number
  dias_disponibilidad?: number | null
}

export interface CotizacionDetalleResponse {
  id: number
  producto_id: number
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  producto_imagen?: string | null
  cantidad: number
  costo: number
  utilidad_pct: number
  precio_venta: number
  stock_actual: number
  dias_disponibilidad: number | null
}

export interface CotizacionCreate {
  fecha: string
  cliente_id: number
  con_factura?: boolean
  incluir_imagenes?: boolean
  modalidad_pago?: string
  forma_pago?: string
  validez_dias?: number
  terminos_condiciones?: string
  descuento?: number
  detalles: CotizacionDetalleCreate[]
}

export interface CotizacionUpdate {
  fecha?: string
  cliente_id?: number
  con_factura?: boolean
  incluir_imagenes?: boolean
  modalidad_pago?: string
  forma_pago?: string
  validez_dias?: number
  terminos_condiciones?: string
  descuento?: number
  detalles?: CotizacionDetalleCreate[]
}

export interface Cotizacion {
  id: number
  numero: string
  fecha: string
  fecha_vencimiento: string
  cliente_id: number
  cliente_razon_social: string
  cliente_nit: string
  cliente_celular: string
  cliente_direccion: string
  estado: string
  con_factura: boolean
  incluir_imagenes: boolean
  modalidad_pago: string
  forma_pago: string
  validez_dias: number
  terminos_condiciones: string
  subtotal: number
  iva: number
  it: number
  descuento: number
  total: number
  activo: boolean
  usuario_id: number
  usuario_username: string
  venta_id: number | null
  fecha_registro: string
  detalles: CotizacionDetalleResponse[]
}

export interface ConvertirVentaRequest {
  comprobante_id: number
  estado_id?: number
  num_comprobante?: string
  automatico?: boolean
}

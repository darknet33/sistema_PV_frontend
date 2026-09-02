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

export interface KardexMovimiento {
  fecha: string
  tipo: 'ENTRADA' | 'SALIDA' | 'SALDO INICIAL'
  detalle: string
  cantidad: number
  precio: number
  saldo: number
}

export interface KardexResponse {
  producto: {
    id: number
    codigo: string
    descripcion: string
    marca: string
    procedencia?: string
    categoria?: string | null
    precio?: number
    utilidad?: number
    stock_inicial: number
    stock_actual: number
    stock_minimo: number
    stock_maximo?: number
    imagen?: string | null
    activo?: boolean
    unidad_principal?: {
      unidad_id: number
      unidad_nombre: string
      unidad_abreviatura: string
      factor_conversion: number
    } | null
  }
  movimientos: KardexMovimiento[]
}

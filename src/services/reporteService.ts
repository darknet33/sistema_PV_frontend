import api from './api'

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

export const getResumenVentas = async (
  fecha_inicio: string,
  fecha_fin: string,
): Promise<ResumenVenta[]> => {
  const response = await api.get('/reportes/resumen/ventas', {
    params: { fecha_inicio, fecha_fin },
  })
  return response.data
}

export const getResumenCompras = async (
  fecha_inicio: string,
  fecha_fin: string,
): Promise<ResumenCompra[]> => {
  const response = await api.get('/reportes/resumen/compras', {
    params: { fecha_inicio, fecha_fin },
  })
  return response.data
}

export const getTopProductos = async (
  fecha_inicio: string,
  fecha_fin: string,
  limite: number = 10,
): Promise<TopProducto[]> => {
  const response = await api.get('/reportes/resumen/top-productos', {
    params: { fecha_inicio, fecha_fin, limite },
  })
  return response.data
}

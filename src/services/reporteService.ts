import api from './api'
import type { ResumenVenta, ResumenCompra, TopProducto } from '../types/reporte'

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

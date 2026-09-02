export interface ProductoUnidad {
  id: number
  unidad_id: number
  unidad_nombre: string
  unidad_abreviatura: string
  es_principal: boolean
  factor_conversion: number
}

export interface ProductoUnidadCreate {
  unidad_id: number
  es_principal: boolean
  factor_conversion: number
}

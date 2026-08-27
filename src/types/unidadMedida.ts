export interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  categoria_unidad_id: number | null
  activo: boolean
  categoria_nombre: string
}

export interface UnidadMedidaCreate {
  nombre: string
  abreviatura?: string
  categoria_unidad_id?: number | null
}

export interface CategoriaUnidad {
  id: number
  nombre: string
  descripcion?: string | null
  activo: boolean
}

export interface CategoriaUnidadCreate {
  nombre: string
  descripcion?: string
}

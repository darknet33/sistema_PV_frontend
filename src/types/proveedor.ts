export interface Proveedor {
  id: number
  nombre: string
  nit: string
  materiales: string
  contacto: string
  celular_contacto: string
  email_contacto: string
  activo: boolean
  fecha_registro: string
}

export interface ProveedorCreate {
  nombre: string
  nit: string
  materiales: string
  contacto: string
  celular_contacto: string
  email_contacto: string
}

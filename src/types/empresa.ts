export interface Empresa {
  id: number
  nombre: string
  razon_social: string
  nit: string
  telefono: string
  correo: string
  direccion: string
  ciudad: string
  logo: string | null
  color_principal: string
  color_secundario: string
}

export type EmpresaUpdate = Omit<Empresa, 'id' | 'logo'>

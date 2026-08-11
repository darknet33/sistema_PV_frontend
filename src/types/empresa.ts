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
  imagen_encabezado: string | null
  imagen_pie: string | null
  color_principal: string
  color_secundario: string
}

export type EmpresaUpdate = Omit<Empresa, 'id' | 'logo' | 'imagen_encabezado' | 'imagen_pie'>

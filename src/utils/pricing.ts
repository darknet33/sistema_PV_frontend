export function calcularPrecioBase(costo: number, utilidad: number, peso: number): number {
  if (peso === 0) return costo + utilidad
  return peso * costo + utilidad
}

export const DEFAULT_COUNTRY_CODE = '591'

export function sanitizePhone(telefono: string | null | undefined): string {
  if (!telefono) return ''
  let digits = telefono.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 8) digits = `${DEFAULT_COUNTRY_CODE}${digits}`
  return digits
}

export function buildWaLink(telefono: string | null | undefined, message: string): string {
  const phone = sanitizePhone(telefono)
  if (!phone) return ''
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
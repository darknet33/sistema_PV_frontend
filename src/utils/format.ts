import dayjs from 'dayjs'

export function formatCurrency(v: number | string | null | undefined): string {
  return `Bs. ${Number(v ?? 0).toFixed(2)}`
}

export function formatDate(f: string | null | undefined, fmt = 'DD/MM/YYYY'): string {
  if (!f) return '-'
  return dayjs(f).format(fmt)
}

export type TextNormalize = 'capitalize' | 'uppercase' | 'lowercase'

export function capitalizeWords(value: string): string {
  return value.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))
}

export function upperText(value: string): string {
  return value.toUpperCase()
}

export function applyNormalize(value: string, mode: TextNormalize): string {
  if (!value) return value
  switch (mode) {
    case 'uppercase':
      return upperText(value)
    case 'lowercase':
      return value.toLowerCase()
    default:
      return capitalizeWords(value)
  }
}

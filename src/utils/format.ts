import dayjs from 'dayjs'

export function formatCurrency(v: number | string | null | undefined): string {
  return `Bs. ${Number(v ?? 0).toFixed(2)}`
}

export function formatDate(f: string | null | undefined, fmt = 'DD/MM/YYYY'): string {
  if (!f) return '-'
  return dayjs(f).format(fmt)
}

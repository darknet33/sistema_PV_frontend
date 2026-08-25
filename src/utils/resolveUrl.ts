export function resolveUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  const apiBase = import.meta.env.VITE_API_URL || ''
  return `${apiBase}${path}`
}

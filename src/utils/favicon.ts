import { resolveUrl } from './resolveUrl'

const FALLBACK_ICON = '/favicon.svg'
const FAVICON_ICO_PATH = '/uploads/empresa/favicon.ico'
const APPLE_TOUCH_PATH = '/uploads/empresa/logo-192.png'
const DEFAULT_THEME_COLOR = '#0f3460'

function setLinkHref(rels: string[], href: string | null, type?: string) {
  rels.forEach((rel) => {
    let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
    if (!href) {
      if (link) link.remove()
      return
    }
    if (!link) {
      link = document.createElement('link')
      link.rel = rel
      document.head.appendChild(link)
    }
    link.href = href
    if (type) link.type = type
  })
}

function withVersion(path: string): string {
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}v=${Date.now()}`
}

export function syncFavicon(logoPath: string | null | undefined, primaryColor?: string | null) {
  if (logoPath) {
    const ico = withVersion(resolveUrl(FAVICON_ICO_PATH))
    const appleTouch = withVersion(resolveUrl(APPLE_TOUCH_PATH))
    setLinkHref(['icon', 'shortcut icon'], ico, 'image/x-icon')
    setLinkHref(['apple-touch-icon'], appleTouch, 'image/png')
  } else {
    setLinkHref(['icon', 'shortcut icon'], FALLBACK_ICON, 'image/svg+xml')
    setLinkHref(['apple-touch-icon'], null)
  }

  const color = primaryColor || DEFAULT_THEME_COLOR
  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = color
}
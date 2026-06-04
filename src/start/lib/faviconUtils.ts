import type { IconMode, QuickLink } from '../types'

export function extractHostname(url: string): string | null {
  try {
    const normalized = url.trim()
    if (!normalized || normalized === 'https://' || normalized === 'http://') return null
    return new URL(normalized.includes('://') ? normalized : `https://${normalized}`).hostname
  } catch {
    return null
  }
}

/** Adres favicon strony (Google Favicon Service — działa dla większości witryn). */
export function getFaviconUrl(url: string, size = 128): string | null {
  const hostname = extractHostname(url)
  if (!hostname) return null
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${size}`
}

export function normalizeQuickLink(link: QuickLink): QuickLink {
  const iconMode: IconMode = link.iconMode ?? 'auto'
  return {
    ...link,
    iconMode,
    icon: link.icon?.trim() || '🔗',
  }
}

export function usesAutoIcon(link: QuickLink): boolean {
  return normalizeQuickLink(link).iconMode === 'auto'
}

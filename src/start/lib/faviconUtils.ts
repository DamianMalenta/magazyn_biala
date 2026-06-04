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

function normalizePageUrl(url: string): string | null {
  try {
    const normalized = url.trim()
    if (!normalized || normalized === 'https://' || normalized === 'http://') return null
    return new URL(normalized.includes('://') ? normalized : `https://${normalized}`).href
  } catch {
    return null
  }
}

/**
 * Lista adresów favicon do wypróbowania po kolei (od najlepszego).
 * Google Favicon V2 → Google S2 → DuckDuckGo → bezpośredni /favicon.ico
 */
export function getFaviconCandidates(url: string, size = 128): string[] {
  const hostname = extractHostname(url)
  const pageUrl = normalizePageUrl(url)
  if (!hostname || !pageUrl) return []

  const sz = Math.min(Math.max(size, 16), 256)

  return [
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(pageUrl)}&size=${sz}`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${sz}`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`,
    `https://${hostname}/favicon.ico`,
    `https://${hostname}/apple-touch-icon.png`,
  ]
}

/** @deprecated Użyj getFaviconCandidates — zwraca pierwszy kandydat */
export function getFaviconUrl(url: string, size = 128): string | null {
  return getFaviconCandidates(url, size)[0] ?? null
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

export function hasValidIconUrl(url: string): boolean {
  return extractHostname(url) !== null
}

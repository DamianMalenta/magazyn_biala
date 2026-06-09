import type { LinkOpenMode, QuickLink } from '../types'
import { resolveQuickLinkUrl } from './internalLinks'
import { isMusicLink } from './musicUtils'

export type { LinkOpenMode }

/** Efektywny tryb otwierania kafelka (uwzględnia domyślne ustawienie workspace). */
export function resolveLinkOpenMode(
  link: QuickLink,
  defaultOpenMode: LinkOpenMode = 'shell',
): LinkOpenMode {
  if (isMusicLink(link.url, link.linkType)) {
    const mode = link.openMode ?? 'embed'
    return mode === 'shell' ? 'embed' : mode
  }
  return link.openMode ?? defaultOpenMode
}
export type EmbedSize = 'compact' | 'medium' | 'large' | 'fullscreen'
export type EmbedKind = 'iframe' | 'youtube-home' | 'blocked'

export interface EmbedInfo {
  url: string
  supportsEmbed: boolean
  kind: EmbedKind
  hint?: string
}

function youtubeEmbedId(pageUrl: URL): string | null {
  const host = pageUrl.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    return pageUrl.pathname.slice(1).split('/')[0] || null
  }

  if (host !== 'youtube.com' && host !== 'm.youtube.com') return null

  const v = pageUrl.searchParams.get('v')
  if (v) return v

  const path = pageUrl.pathname
  const patterns = [
    /^\/embed\/([\w-]+)/,
    /^\/shorts\/([\w-]+)/,
    /^\/live\/([\w-]+)/,
    /^\/v\/([\w-]+)/,
  ]
  for (const re of patterns) {
    const m = path.match(re)
    if (m) return m[1]
  }

  return null
}

/** Konwersja URL na adres do iframe (YouTube, Vimeo itd.) */
export function getEmbedInfo(pageUrl: string): EmbedInfo {
  const trimmed = pageUrl.trim()
  if (!trimmed) return { url: '', supportsEmbed: false, kind: 'blocked' }

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, '')

    const ytId = youtubeEmbedId(url)
    if (ytId) {
      const list = url.searchParams.get('list')
      const embedUrl = list
        ? `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&list=${list}`
        : `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`
      return { url: embedUrl, supportsEmbed: true, kind: 'iframe' }
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      const list = url.searchParams.get('list')
      if (list && !url.searchParams.get('v')) {
        return {
          url: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}&rel=0`,
          supportsEmbed: true,
          kind: 'iframe',
        }
      }
      if (url.pathname === '/' || url.pathname === '') {
        return {
          url: '',
          supportsEmbed: true,
          kind: 'youtube-home',
          hint: 'Strona główna YouTube nie pozwala na podgląd — wklej link do filmu lub otwórz pełną stronę.',
        }
      }
      return {
        url: '',
        supportsEmbed: true,
        kind: 'youtube-home',
        hint: 'Ten adres YouTube nie obsługuje podglądu — wklej link do filmu (watch?v=…) lub otwórz pełną stronę.',
      }
    }

    if (host === 'vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      if (id && /^\d+$/.test(id)) {
        return { url: `https://player.vimeo.com/video/${id}`, supportsEmbed: true, kind: 'iframe' }
      }
    }

    if (host === 'google.com' && url.pathname.includes('/maps')) {
      return {
        url: trimmed,
        supportsEmbed: true,
        kind: 'iframe',
        hint: 'Użyj linku „Udostępnij → Umieść mapę” dla najlepszego efektu.',
      }
    }

    return {
      url: url.href,
      supportsEmbed: true,
      kind: 'iframe',
      hint: 'Niektóre strony (Facebook, banki, POS) blokują podgląd — wtedy użyj „Nowa karta”.',
    }
  } catch {
    return { url: '', supportsEmbed: false, kind: 'blocked' }
  }
}

export function resolveYoutubeEmbedUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^[\w-]{6,}$/.test(trimmed) && !trimmed.includes('.')) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}?rel=0`
  }

  try {
    const info = getEmbedInfo(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    return info.kind === 'iframe' && info.url ? info.url : null
  } catch {
    return null
  }
}

export const OPEN_MODE_LABELS: Record<LinkOpenMode, string> = {
  tab: 'Nowa karta (pełna strona)',
  embed: 'Panel pod kafelkami',
  window: 'Osobne okno przeglądarki',
  shell: 'Pod paskiem ekranu głównego',
}

export const OPEN_MODE_DESCRIPTIONS: Record<LinkOpenMode, string> = {
  tab: 'Otwiera pełną stronę w nowej karcie Chrome.',
  embed: 'Rozsuwa panel pod kafelkami na ekranie głównym — muzyka, YouTube, mapy.',
  window: 'Otwiera osobne okno przeglądarki (np. na drugi monitor).',
  shell: 'Otwiera treść wewnątrz tego samego okna, pod paskiem ekranu głównego (iframe).',
}

export const EMBED_SIZE_HEIGHT: Record<EmbedSize, string> = {
  compact: '280px',
  medium: '420px',
  large: 'min(60vh, 560px)',
  fullscreen: 'min(78vh, 720px)',
}

/** Nowa karta Chrome — pełna strona (bez nawigacji bieżącej karty). */
export function openLinkInTab(url: string): void {
  const resolved = resolveQuickLinkUrl(url)
  const anchor = document.createElement('a')
  anchor.href = resolved
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

/** Osobne okno przeglądarki z rozmiarem. */
export function openLinkInWindow(url: string, label: string): void {
  const resolved = resolveQuickLinkUrl(url)
  const name = `biala-win-${label.replace(/\s+/g, '-').slice(0, 24)}`
  const features = [
    'noopener',
    'noreferrer',
    'width=1280',
    'height=800',
    'left=80',
    'top=48',
    'menubar=yes',
    'toolbar=yes',
    'location=yes',
    'status=yes',
    'scrollbars=yes',
    'resizable=yes',
  ].join(',')
  const opened = window.open(resolved, name, features)
  if (!opened) openLinkInTab(url)
}

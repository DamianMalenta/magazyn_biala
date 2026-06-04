export type LinkOpenMode = 'tab' | 'embed' | 'window'
export type EmbedSize = 'compact' | 'medium' | 'large' | 'fullscreen'

export interface EmbedInfo {
  url: string
  supportsEmbed: boolean
  hint?: string
}

/** Konwersja URL na adres do iframe (YouTube, Vimeo itd.) */
export function getEmbedInfo(pageUrl: string): EmbedInfo {
  const trimmed = pageUrl.trim()
  if (!trimmed) return { url: '', supportsEmbed: false }

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, '')

    // YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = url.searchParams.get('v')
      if (id) {
        return {
          url: `https://www.youtube.com/embed/${id}?rel=0`,
          supportsEmbed: true,
        }
      }
      const embedMatch = url.pathname.match(/^\/embed\/([\w-]+)/)
      if (embedMatch) {
        return { url: `https://www.youtube.com/embed/${embedMatch[1]}?rel=0`, supportsEmbed: true }
      }
    }
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      if (id) {
        return { url: `https://www.youtube.com/embed/${id}?rel=0`, supportsEmbed: true }
      }
    }

    // Vimeo
    if (host === 'vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      if (id && /^\d+$/.test(id)) {
        return { url: `https://player.vimeo.com/video/${id}`, supportsEmbed: true }
      }
    }

    // Google Maps embed
    if (host === 'google.com' && url.pathname.includes('/maps')) {
      return {
        url: trimmed,
        supportsEmbed: true,
        hint: 'Użyj linku „Udostępnij → Umieść mapę” dla najlepszego efektu.',
      }
    }

    // Własna strona / inne — próba bezpośredniego osadzenia
    return {
      url: url.href,
      supportsEmbed: true,
      hint: 'Niektóre strony (Facebook, banki, POS) blokują podgląd — wtedy użyj „Nowa karta”.',
    }
  } catch {
    return { url: '', supportsEmbed: false }
  }
}

export const OPEN_MODE_LABELS: Record<LinkOpenMode, string> = {
  tab: 'Nowa karta (pełna strona)',
  embed: 'Panel na stronie startowej',
  window: 'Osobne okno przeglądarki',
}

export const OPEN_MODE_DESCRIPTIONS: Record<LinkOpenMode, string> = {
  tab: 'Otwiera pełną stronę w nowej karcie Chrome — zalecane dla YouTube, Facebooka, POS.',
  embed: 'Mini-podgląd w oknie na stronie startowej — działa m.in. z YouTube i Vimeo.',
  window: 'Otwiera osobne okno (np. na drugi monitor).',
}

export const EMBED_SIZE_HEIGHT: Record<EmbedSize, string> = {
  compact: '320px',
  medium: '480px',
  large: 'min(72vh, 680px)',
  fullscreen: '92vh',
}

export function openLinkInWindow(url: string, label: string): void {
  window.open(url, '_blank', 'noopener,noreferrer,width=1280,height=800')
  void label
}

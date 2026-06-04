/** Stacje i wyszukiwanie radiowych strumieni audio (bez wideo). */

export interface MusicStation {
  id: string
  name: string
  streamUrl: string
  /** Zapasowe adresy (np. mirror Icecast). */
  fallbackUrls?: string[]
  tags?: string
  country?: string
  favicon?: string
  source: 'preset' | 'radio-browser'
}

export type MusicCategoryId = 'lounge' | 'jazz' | 'chill' | 'pop' | 'pl'

export interface MusicCategory {
  id: MusicCategoryId
  label: string
  emoji: string
  /** Parametry wyszukiwania Radio Browser (oprócz presetów). */
  search?: {
    tag?: string
    tagList?: string
    countrycode?: string
    language?: string
  }
}

function soma(slug: string): Pick<MusicStation, 'streamUrl' | 'fallbackUrls'> {
  const base = slug.endsWith('-128-mp3') ? slug : `${slug}-128-mp3`
  return {
    streamUrl: `https://ice1.somafm.com/${base}`,
    fallbackUrls: [`https://ice2.somafm.com/${base}`],
  }
}

/** Bezpośrednie strumienie HTTPS — działają na GitHub Pages (bez mixed content). */
export const MUSIC_PRESETS: Record<MusicCategoryId, MusicStation[]> = {
  lounge: [
    {
      id: 'soma-groove',
      name: 'SomaFM — Groove Salad',
      ...soma('groovesalad'),
      tags: 'downtempo, lounge',
      source: 'preset',
    },
    {
      id: 'soma-lush',
      name: 'SomaFM — Lush',
      ...soma('lush'),
      tags: 'lounge, ambient',
      source: 'preset',
    },
    {
      id: 'rp-main',
      name: 'Radio Paradise — Main',
      streamUrl: 'https://stream.radioparadise.com/aac-320',
      tags: 'eclectic, lounge',
      source: 'preset',
    },
  ],
  jazz: [
    {
      id: 'soma-secret',
      name: 'SomaFM — Secret Agent',
      ...soma('secretagent'),
      tags: 'jazz, lounge',
      source: 'preset',
    },
    {
      id: 'soma-bossa',
      name: 'SomaFM — Bossa Beyond',
      ...soma('bossa'),
      tags: 'bossa, jazz',
      source: 'preset',
    },
    {
      id: 'fip',
      name: 'Radio France — FIP',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      tags: 'jazz, eclectic',
      country: 'Francja',
      source: 'preset',
    },
  ],
  chill: [
    {
      id: 'soma-drone',
      name: 'SomaFM — Drone Zone',
      ...soma('dronezone'),
      tags: 'ambient, chill',
      source: 'preset',
    },
    {
      id: 'soma-deepspace',
      name: 'SomaFM — Deep Space One',
      ...soma('deepspaceone'),
      tags: 'ambient, space',
      source: 'preset',
    },
    {
      id: 'soma-fluid',
      name: 'SomaFM — Fluid',
      ...soma('fluid'),
      tags: 'chill, electronic',
      source: 'preset',
    },
  ],
  pop: [
    {
      id: 'soma-indie',
      name: 'SomaFM — Indie Pop',
      ...soma('indiepop'),
      tags: 'indie, pop',
      source: 'preset',
    },
    {
      id: 'soma-poptron',
      name: 'SomaFM — PopTron',
      ...soma('poptron'),
      tags: 'electropop, synth',
      source: 'preset',
    },
    {
      id: 'soma-covers',
      name: 'SomaFM — Covers',
      ...soma('covers'),
      tags: 'covers, pop',
      source: 'preset',
    },
  ],
  pl: [
    {
      id: 'rmf-maxxx',
      name: 'RMF MAXXX',
      streamUrl: 'https://rs9-krk2-cyfronet.rmfstream.pl/RMFMAXXX48',
      fallbackUrls: ['https://rs8-krk2-cyfronet.rmfstream.pl/RMFMAXXX48'],
      tags: 'dance, pop',
      country: 'Polska',
      source: 'preset',
    },
    {
      id: 'rmf-fm',
      name: 'RMF FM',
      streamUrl: 'https://rs9-krk2-cyfronet.rmfstream.pl/rmf_fm',
      fallbackUrls: ['https://rs8-krk2-cyfronet.rmfstream.pl/rmf_fm'],
      tags: 'pop, hits',
      country: 'Polska',
      source: 'preset',
    },
    {
      id: 'radio-zet',
      name: 'Radio ZET',
      streamUrl: 'https://r.dcs.redcdn.pl/sc/o2/Eurozet/live/audio.livx?audio=5',
      tags: 'pop, news',
      country: 'Polska',
      source: 'preset',
    },
  ],
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  { id: 'lounge', label: 'Lounge', emoji: '🛋️', search: { tag: 'lounge' } },
  { id: 'jazz', label: 'Jazz', emoji: '🎷', search: { tag: 'jazz' } },
  { id: 'chill', label: 'Chill', emoji: '🌿', search: { tagList: 'chill,ambient' } },
  { id: 'pop', label: 'Pop', emoji: '🎵', search: { tag: 'pop' } },
  { id: 'pl', label: 'Polskie', emoji: '🇵🇱', search: { countrycode: 'PL', tag: 'pop' } },
]

const RADIO_BROWSER = 'https://de1.api.radio-browser.info/json/stations/search'
const RADIO_USER_AGENT = 'MagazynBialaStartPanel/1.0 (https://damianmalenta.github.io/magazyn_biala/)'

const LAST_STATION_KEY = 'startpage-music-last-station'

interface RadioBrowserRow {
  stationuuid: string
  name: string
  url_resolved: string
  favicon?: string
  tags?: string
  country?: string
  codec?: string
  lastcheckok?: number
}

export function isMusicLink(url: string, linkType?: string): boolean {
  if (linkType === 'music') return true
  const t = url.trim().toLowerCase()
  return t === 'music:' || t === 'music://player' || t.startsWith('music://')
}

export function streamUrlsForStation(station: MusicStation): string[] {
  const urls = [station.streamUrl, ...(station.fallbackUrls ?? [])]
  return [...new Set(urls.filter(Boolean))]
}

export function loadLastStation(): MusicStation | null {
  try {
    const raw = localStorage.getItem(LAST_STATION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MusicStation
  } catch {
    return null
  }
}

export function saveLastStation(station: MusicStation): void {
  localStorage.setItem(LAST_STATION_KEY, JSON.stringify(station))
}

export async function fetchRadioStations(
  search: MusicCategory['search'],
  limit = 10,
): Promise<MusicStation[]> {
  if (!search) return []

  const params = new URLSearchParams({
    hidebroken: 'true',
    limit: String(limit * 2),
    order: 'votes',
    reverse: 'true',
  })

  if (search.tag) params.set('tag', search.tag)
  if (search.tagList) params.set('tagList', search.tagList)
  if (search.countrycode) params.set('countrycode', search.countrycode)
  if (search.language) params.set('language', search.language)

  const res = await fetch(`${RADIO_BROWSER}?${params}`, {
    headers: { 'User-Agent': RADIO_USER_AGENT },
  })

  if (!res.ok) return []

  const rows = (await res.json()) as RadioBrowserRow[]
  return rows
    .filter((r) => r.lastcheckok !== 0 && r.url_resolved?.startsWith('https://'))
    .slice(0, limit)
    .map((r) => ({
      id: r.stationuuid,
      name: r.name,
      streamUrl: r.url_resolved,
      tags: r.tags,
      country: r.country,
      favicon: r.favicon || undefined,
      source: 'radio-browser' as const,
    }))
}

export function stationsForCategory(categoryId: MusicCategoryId): MusicStation[] {
  return MUSIC_PRESETS[categoryId] ?? []
}

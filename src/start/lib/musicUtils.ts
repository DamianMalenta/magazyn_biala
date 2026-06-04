/** Stacje i wyszukiwanie radiowych strumieni audio (bez wideo). */

export interface MusicStation {
  id: string
  name: string
  streamUrl: string
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

/** Bezpośrednie strumienie — bez API, bez reklam w panelu (same audio). */
export const MUSIC_PRESETS: Record<MusicCategoryId, MusicStation[]> = {
  lounge: [
    {
      id: 'jam-lounge',
      name: 'Jamendo — Lounge',
      streamUrl: 'https://streaming.jamendo.com/JamLounge',
      tags: 'lounge, ambient',
      source: 'preset',
    },
    {
      id: 'jam-chillout',
      name: 'Jamendo — Chillout',
      streamUrl: 'https://streaming.jamendo.com/JamChillout',
      tags: 'chillout',
      source: 'preset',
    },
    {
      id: 'soma-groove',
      name: 'SomaFM — Groove Salad',
      streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
      tags: 'downtempo, lounge',
      source: 'preset',
    },
  ],
  jazz: [
    {
      id: 'jam-jazz',
      name: 'Jamendo — Jazz',
      streamUrl: 'https://streaming.jamendo.com/JamJazz',
      tags: 'jazz',
      source: 'preset',
    },
    {
      id: 'soma-secret',
      name: 'SomaFM — Secret Agent',
      streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
      tags: 'jazz, lounge',
      source: 'preset',
    },
  ],
  chill: [
    {
      id: 'jam-ambient',
      name: 'Jamendo — Ambient',
      streamUrl: 'https://streaming.jamendo.com/JamAmbient',
      tags: 'ambient',
      source: 'preset',
    },
    {
      id: 'soma-drone',
      name: 'SomaFM — Drone Zone',
      streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
      tags: 'ambient, chill',
      source: 'preset',
    },
    {
      id: 'soma-defcon',
      name: 'SomaFM — DEF CON',
      streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
      tags: 'electronic, chill',
      source: 'preset',
    },
  ],
  pop: [
    {
      id: 'jam-pop',
      name: 'Jamendo — Pop',
      streamUrl: 'https://streaming.jamendo.com/JamPop',
      tags: 'pop',
      source: 'preset',
    },
    {
      id: 'jam-rock',
      name: 'Jamendo — Rock',
      streamUrl: 'https://streaming.jamendo.com/JamRock',
      tags: 'rock',
      source: 'preset',
    },
    {
      id: 'soma-indie',
      name: 'SomaFM — Indie Pop',
      streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
      tags: 'indie, pop',
      source: 'preset',
    },
  ],
  pl: [
    {
      id: 'rmf-maxxx',
      name: 'RMF MAXXX',
      streamUrl: 'https://rs6-ssl.rmfon.pl/rmf_maxxx',
      tags: 'dance, pop',
      country: 'Polska',
      source: 'preset',
    },
    {
      id: 'rmf-classic',
      name: 'RMF Classic',
      streamUrl: 'https://rs6-ssl.rmfon.pl/rmf_classic',
      tags: 'classic',
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
  { id: 'pl', label: 'Polskie', emoji: '🇵🇱', search: { countrycode: 'PL', tag: 'lounge' } },
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
    limit: String(limit),
    order: 'votes',
    reverse: 'true',
    codec: 'MP3',
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
    .filter((r) => r.lastcheckok !== 0 && r.url_resolved)
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

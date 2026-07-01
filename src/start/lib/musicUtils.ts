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
  source: 'preset' | 'radio-browser' | 'local-files'
  /** Folder playlisty w local-music/lokalnie/ (tylko source: local-files). */
  localFolder?: string
}

export type MusicCategoryId = 'stacje-radiowe' | 'lokalnie' | 'polskie-radio' | 'lokalne-kom'

/** Identyfikator strumienia lokalnego — nie jest adresem URL. */
export function localStreamId(folder: string): string {
  return `local://${folder}`
}

/** Główny podział: komercyjne (PL radio) vs niekomercyjne (reszta). */
export type MusicTabId = 'commercial' | 'non-commercial'

export interface MusicTab {
  id: MusicTabId
  label: string
  emoji: string
  /** Krótki opis pod zakładką. */
  hint: string
  categoryIds: MusicCategoryId[]
}

export interface MusicCategorySearch {
  tag?: string
  tagList?: string
  countrycode?: string
  language?: string
}

export interface MusicCategory {
  id: MusicCategoryId
  label: string
  emoji: string
  tab: MusicTabId
  /** Zapytania Radio Browser — wiele wyników jest łączonych. */
  onlineSearches?: MusicCategorySearch[]
}

export const MUSIC_TABS: MusicTab[] = [
  {
    id: 'non-commercial',
    label: 'Niekomercyjne',
    emoji: '✓',
    hint: 'Stacje radiowe międzynarodowe oraz playlisty CC0 z folderu na tym komputerze',
    categoryIds: ['stacje-radiowe', 'lokalnie'],
  },
  {
    id: 'commercial',
    label: 'Komercyjne',
    emoji: '🇵🇱',
    hint: 'Polskie radio komercyjne i własne playlisty z lokalu — radio wymaga licencji ZAiKS/STOART',
    categoryIds: ['polskie-radio', 'lokalne-kom'],
  },
]

function soma(slug: string): Pick<MusicStation, 'streamUrl' | 'fallbackUrls'> {
  const base = slug.endsWith('-128-mp3') ? slug : `${slug}-128-mp3`
  return {
    streamUrl: `https://ice1.somafm.com/${base}`,
    fallbackUrls: [`https://ice2.somafm.com/${base}`],
  }
}

const INTERNATIONAL_RADIO_STATIONS: MusicStation[] = [
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
    streamUrl: 'https://stream.radioparadise.com/aac-128',
    fallbackUrls: ['https://stream.radioparadise.com/aac-320'],
    tags: 'eclectic, lounge',
    source: 'preset',
  },
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
]

const POLISH_RADIO_STATIONS: MusicStation[] = [
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
    streamUrl: 'https://zt01.cdn.eurozet.pl/zet-net.mp3',
    fallbackUrls: [
      'https://zt02.cdn.eurozet.pl/zet-old.mp3',
      'https://r.dcs.redcdn.pl/sc/o2/Eurozet/live/audio.livx?audio=5',
    ],
    tags: 'pop, news',
    country: 'Polska',
    source: 'preset',
  },
]

function localPlaylistStation(id: string, folder: string, name: string, tags: string): MusicStation {
  return {
    id,
    name,
    streamUrl: localStreamId(folder),
    localFolder: folder,
    tags: `${tags} · CC0 · ten komputer`,
    source: 'local-files',
  }
}

/** Playlisty z folderu local-music/lokalnie/ na tym komputerze. */
const LOKALNIE_PLAYLISTS: MusicStation[] = [
  localPlaylistStation('local-pop-radio', 'pop-radio', 'Pop & Radio — młodzież', 'pop'),
  localPlaylistStation('local-dance-edm', 'dance-edm', 'Dance & EDM', 'dance, edm'),
  localPlaylistStation('local-hiphop-trap', 'hiphop-trap', 'Hip-Hop & Trap', 'hip-hop, trap'),
  localPlaylistStation('local-chill-pop', 'chill-pop', 'Chill Pop', 'chill, lofi'),
  localPlaylistStation('local-lunch-jazz', 'lunch-jazz', 'Lunch & Jazz', 'jazz, lunch'),
  localPlaylistStation('local-kolacja', 'kolacja', 'Kolacja', 'bossa, kolacja'),
  localPlaylistStation('local-akustyczna', 'akustyczna', 'Akustyczna', 'folk, akustyczna'),
]

/** Bezpośrednie strumienie HTTPS — działają na GitHub Pages (bez mixed content). */
export const MUSIC_PRESETS: Record<MusicCategoryId, MusicStation[]> = {
  'stacje-radiowe': INTERNATIONAL_RADIO_STATIONS,
  lokalnie: LOKALNIE_PLAYLISTS,
  'polskie-radio': POLISH_RADIO_STATIONS,
  'lokalne-kom': [],
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: 'stacje-radiowe',
    label: 'Stacje radiowe',
    emoji: '📻',
    tab: 'non-commercial',
    onlineSearches: [
      { tag: 'lounge' },
      { tag: 'jazz' },
      { tagList: 'chill,ambient' },
      { tag: 'pop' },
    ],
  },
  {
    id: 'lokalnie',
    label: 'Lokalnie',
    emoji: '🏠',
    tab: 'non-commercial',
  },
  {
    id: 'polskie-radio',
    label: 'Polskie radio',
    emoji: '🇵🇱',
    tab: 'commercial',
    onlineSearches: [{ countrycode: 'PL', tag: 'pop' }],
  },
  {
    id: 'lokalne-kom',
    label: 'Lokalne',
    emoji: '🏠',
    tab: 'commercial',
  },
]

export function categoriesForTab(tabId: MusicTabId): MusicCategory[] {
  const tab = MUSIC_TABS.find((t) => t.id === tabId)
  if (!tab) return []
  return MUSIC_CATEGORIES.filter((c) => tab.categoryIds.includes(c.id))
}

export function tabForCategory(categoryId: MusicCategoryId): MusicTabId {
  return MUSIC_CATEGORIES.find((c) => c.id === categoryId)?.tab ?? 'non-commercial'
}

export function defaultCategoryForTab(tabId: MusicTabId): MusicCategoryId {
  return categoriesForTab(tabId)[0]?.id ?? 'stacje-radiowe'
}

export function isLocalFilesStation(station: MusicStation): boolean {
  return station.source === 'local-files' || station.streamUrl.startsWith('local://')
}

/** Przywraca zakładkę i kategorię na podstawie ostatnio granej stacji. */
export function inferTabAndCategory(station: MusicStation | null): {
  tab: MusicTabId
  category: MusicCategoryId
} {
  if (!station) {
    return { tab: 'non-commercial', category: 'stacje-radiowe' }
  }

  for (const catId of Object.keys(MUSIC_PRESETS) as MusicCategoryId[]) {
    const presets = MUSIC_PRESETS[catId]
    if (presets.some((s) => s.id === station.id || s.streamUrl === station.streamUrl)) {
      return { tab: tabForCategory(catId), category: catId }
    }
  }

  if (station.country === 'Polska') {
    return { tab: 'commercial', category: 'polskie-radio' }
  }

  return { tab: 'non-commercial', category: 'stacje-radiowe' }
}

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
  hls?: number
}

const ALLOWED_STREAM_CODECS = new Set(['MP3', 'AAC', 'AAC+'])

export function isAllowedStreamCodec(codec?: string): boolean {
  if (!codec) return false
  return ALLOWED_STREAM_CODECS.has(codec.trim().toUpperCase())
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
  search: MusicCategorySearch | undefined,
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
    .filter(
      (r) =>
        r.lastcheckok !== 0 &&
        r.url_resolved?.startsWith('https://') &&
        r.hls !== 1 &&
        isAllowedStreamCodec(r.codec),
    )
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

function mergeStations(base: MusicStation[], extra: MusicStation[]): MusicStation[] {
  const merged = [...base]
  for (const station of extra) {
    if (!merged.some((m) => m.streamUrl === station.streamUrl)) merged.push(station)
  }
  return merged
}

/** Presety + stacje z Radio Browser dla wybranej kategorii. */
export async function stationsWithOnlineForCategory(
  categoryId: MusicCategoryId,
  onlineLimit = 8,
): Promise<MusicStation[]> {
  const presets = stationsForCategory(categoryId)
  const cat = MUSIC_CATEGORIES.find((c) => c.id === categoryId)
  if (!cat?.onlineSearches?.length) return presets

  const perSearch = Math.max(2, Math.ceil(onlineLimit / cat.onlineSearches.length))

  try {
    const batches = await Promise.all(
      cat.onlineSearches.map((search) => fetchRadioStations(search, perSearch)),
    )
    let merged = presets
    for (const batch of batches) {
      const filtered =
        categoryId === 'stacje-radiowe'
          ? batch.filter((s) => s.country !== 'Polska')
          : batch
      merged = mergeStations(merged, filtered)
    }
    return merged
  } catch {
    return presets
  }
}

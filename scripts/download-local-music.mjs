#!/usr/bin/env node
/**
 * Pobiera muzykę royalty-free do folderów Lokalnie w panelu.
 *
 * Źródła:
 *   - Mixkit (mixkit.co) — większość playlist
 *   - FMA + Bandcamp — playlista „polskie” (polski hip-hop/reggae, CC0 / CC BY — komercyjnie)
 *   - Trzciamajka — tylko z flagą --with-trzciamajka lub ręcznie z trzciamajka-incoming/
 *
 * Użycie:
 *   npm run download:local-music
 *   npm run download:local-music -- --playlist polskie --clean
 *   npm run clean:local-music
 *   node scripts/download-local-music.mjs --out ./local-music/lokalnie
 *
 * Po pobraniu w panelu: Niekomercyjne → Lokalnie → „Wybierz folder z muzyką”.
 */

import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, readdir, copyFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { syncFolderToManifest, wipeMp3 } from './local-music-cleanup.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const UA = 'MagazynBialaLocalMusic/2.3 (https://github.com/DamianMalenta/magazyn_biala)'
const TRACKS_PER_PLAYLIST = 12
const FMA_DELAY_MS = 400

/** Słowa w tytule = raczej nie do lokalu gastronomicznego. */
const SKIP_TITLE = /\b(horror|fright|nightmare|scary|thriller|piano horror|hard techno|techno fight|danger)\b/i

/**
 * Playlisty = foldery w panelu.
 * mixkitCategories — gatunki z mixkit.co (JSON-LD na stronie kategorii).
 * mixkitIds — ręcznie dobrane utwory (nadpisują / uzupełniają listę).
 * fmaAlbums — albumy CC0 z Free Music Archive (opcjonalnie).
 * bandcampAlbums — reggae/dub z Bandcamp (tylko licencje komercyjne, np. CC BY).
 */
/** Artyści ze sceny Trzciamajki (Trzcianka) — zwykle nie ma ich w automatycznym pobieraniu. */
const TRZCIAMAJKA_SCENE = [
  { name: 'BEZJAHZGH', city: 'Trzcianka', style: 'reggae, raggamuffin, ska', note: 'Lou & Rocked Boys — płyty „Nie na chacie”, „Przeczas”' },
  { name: 'Roots Soldiers', city: 'Radlin / Śląsk', style: 'roots reggae, dub', note: 'rootssoldiers.pl — laureaci eliminacji Trzciamajka' },
  { name: 'Demo', city: 'Trzcianka', style: 'rock / reggae', note: 'lokalny zespół festiwalu' },
  { name: 'Jah No Sleep', city: 'PL', style: 'dub z winyli', note: 'sety DJ po koncertach Trzciamajka' },
  { name: 'Qulturka', city: 'Piła', style: 'punk, ska, reggae', note: 'Trzciamajka 2026' },
  { name: 'Dubska', city: 'Bydgoszcz', style: 'reggae, dub, ska', note: 'Trzciamajka 2026' },
  { name: 'Vavamuffin', city: 'PL', style: 'reggae', note: 'Trzciamajka 2026' },
  { name: 'Dr Misio', city: 'PL', style: 'reggae', note: 'Trzciamajka 2026' },
]

/** Oficjalne nagrania z YouTube (kanały Bez Jahzgh / Roots Soldiers / LouRockedTV). */
const TRZCIAMAJKA_YOUTUBE = [
  { videoId: 'CCuRSTfCikE', title: 'Agrorap', artist: 'BEZJAHZGH' },
  { videoId: '9H9-xC7X7B4', title: 'Trzciamajka', artist: 'BEZJAHZGH' },
  { videoId: '89qAkA7OY7E', title: 'Kasety', artist: 'BEZJAHZGH' },
  { videoId: '26fz5SEkPcQ', title: 'Swiat Razu Pewnego', artist: 'BEZJAHZGH' },
  { videoId: 'P7IoWrfPK4U', title: 'Wybieram W Droge Sie', artist: 'BEZJAHZGH' },
  { videoId: 'weO6S7jiEyo', title: 'Od-Nowa', artist: 'Roots Soldiers' },
  { videoId: 'aIvJh2D7IhE', title: 'Skala', artist: 'Roots Soldiers' },
  { videoId: 'XA1qvOYUsbA', title: 'Nie Boje Sie', artist: 'Roots Soldiers' },
  { videoId: '0bq7fVMURNY', title: 'Recepta', artist: 'Roots Soldiers' },
]

/** Bandcamp polskiej sceny — pobierane przy zgodzie artysty (pomija wymóg CC BY komercyjnego). */
const TRZCIAMAJKA_BANDCAMP = [
  {
    url: 'https://muflondub.bandcamp.com/album/krol-milosc',
    artist: 'Muflon Dub Sound System',
    artistConsent: true,
    license: 'zgoda artysty',
    vibe: 'polski reggae — Wielkopolska',
    trackTitles: [
      'Krol Milosc',
      'Bedziemy Tanczyc',
      'Tak To My',
      'Razem',
      'Jordan',
      'Powstan',
    ],
  },
]

const TRZCIAMAJKA_INCOMING_DIR = join(__dirname, '..', 'local-music', 'trzciamajka-incoming')
const TRZCIAMAJKA_SOURCES_FILE = join(__dirname, '..', 'local-music', 'trzciamajka-sources.json')

const PLAYLISTS = {
  'pop-radio': {
    label: 'Pop & Radio — młodzież',
    curatedOnly: true,
    mixkitIds: [
      5, 250, 288, 801, 1000, 1124, 350, 837, 200, 1131, 935, 970,
    ],
    skipPattern: /\b(horror|fright|nightmare|scary)\b/i,
  },
  'dance-edm': {
    label: 'Dance & EDM',
    curatedOnly: true,
    mixkitIds: [
      623, 371, 471, 1001, 628, 744, 468, 473, 180, 190, 777, 620,
    ],
    skipPattern: /\b(horror|fright|techno fight|hard techno)\b/i,
  },
  'hiphop-trap': {
    label: 'Hip-Hop & Trap',
    curatedOnly: true,
    mixkitIds: [
      738, 739, 416, 434, 489, 485, 487, 1141, 228, 432, 282, 375,
    ],
    skipPattern: /\b(horror|fright|arab nights|waka|hamza)\b/i,
  },
  'chill-pop': {
    label: 'Chill Pop',
    curatedOnly: true,
    mixkitIds: [
      27, 443, 234, 480, 475, 513, 105, 640, 699, 175, 389, 765,
    ],
    skipPattern: /\b(horror|fright|meditation)\b/i,
  },
  'lunch-jazz': {
    label: 'Lunch & Jazz',
    curatedOnly: true,
    mixkitIds: [
      493, 39, 752, 644, 89, 528, 24, 494, 40, 652, 639, 647,
    ],
    skipPattern: /\b(horror|fright|hard techno|comedy|hungry)\b/i,
  },
  kolacja: {
    label: 'Kolacja',
    curatedOnly: true,
    mixkitIds: [
      518, 526, 502, 664, 743, 672, 724, 700, 687, 868, 820, 336,
    ],
    skipPattern: /\b(hip hop|trap|techno|horror|fright|hard|fight|comedy|humorous|ironic|phat|hungry)\b/i,
  },
  akustyczna: {
    label: 'Akustyczna',
    curatedOnly: true,
    mixkitIds: [
      12, 87, 797, 23, 36, 617, 859, 547, 790, 844, 789, 1063,
    ],
    skipPattern: /\b(horror|fright|farm fun)\b/i,
  },
  polskie: {
    label: 'Polskie',
    license: 'CC0 + CC BY 4.0 — użytek komercyjny w lokalu (atrybucja przy CC BY)',
    source: 'https://freemusicarchive.org/',
    fmaAlbums: [
      {
        url: 'https://freemusicarchive.org/music/holiznacc0/bassic',
        artist: 'HoliznaCC0',
        maxTracks: 6,
        vibe: 'polski hip-hop / funk — CC0',
      },
      {
        url: 'https://freemusicarchive.org/music/holiznaraps/when-you-see-me-now',
        artist: 'HoliznaRAPS',
        maxTracks: 2,
        vibe: 'polski hip-hop — CC0',
      },
      {
        url: 'https://freemusicarchive.org/music/holiznacc0/public-domain-lofi',
        artist: 'HoliznaCC0',
        maxTracks: 4,
        vibe: 'polski lo-fi — CC0',
      },
      {
        url: 'https://freemusicarchive.org/music/Dilating_Times/single/poland-24',
        artist: 'Jangwa',
        maxTracks: 1,
        vibe: 'reggae / dancehall — CC BY 4.0',
        allowCcBy: true,
      },
    ],
  },
}

function parseArgs(argv) {
  const outIdx = argv.indexOf('--out')
  const playlistIdx = argv.indexOf('--playlist')
  const outDir = outIdx >= 0 ? argv[outIdx + 1] : join(__dirname, '..', 'local-music', 'lokalnie')
  const playlistFilter = playlistIdx >= 0 ? argv[playlistIdx + 1] : null
  const clean = argv.includes('--clean')
  const withTrzciamajka = argv.includes('--with-trzciamajka')
  return { outDir, playlistFilter, clean, withTrzciamajka }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 55)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasMixkitSource(config) {
  return (config.mixkitCategories?.length ?? 0) > 0 || (config.mixkitIds?.length ?? 0) > 0
}

function hasFmaSource(config) {
  return (config.fmaAlbums?.length ?? 0) > 0
}

function mixkitIdFromUrl(url) {
  const m = url.match(/assets\.mixkit\.co\/music\/(\d+)\//)
  return m ? m[1] : null
}

function mixkitMp3Url(id) {
  return `https://assets.mixkit.co/music/${id}/${id}.mp3`
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return res.text()
}

/** Parsuje metadane utworów z JSON-LD na stronie kategorii Mixkit. */
function parseMixkitCategoryJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (!match) return []

  let data
  try {
    data = JSON.parse(match[1])
  } catch {
    return []
  }

  const graph = data['@graph'] ?? [data]
  const list = graph.find((node) => node['@type'] === 'ItemList')
  if (!list?.itemListElement?.length) return []

  const tracks = []
  for (const item of list.itemListElement) {
    if (item['@type'] !== 'MusicRecording') continue
    const id = mixkitIdFromUrl(item.url ?? '')
    if (!id) continue
    tracks.push({
      id,
      title: item.name ?? `Mixkit ${id}`,
      artist: item.byArtist ?? 'Mixkit',
      url: item.url ?? mixkitMp3Url(id),
      license: item.license ?? 'https://mixkit.co/license/#musicFree',
    })
  }
  return tracks
}

async function fetchMixkitCategory(category) {
  const html = await fetchText(`https://mixkit.co/free-stock-music/${category}/`)
  return parseMixkitCategoryJsonLd(html)
}

async function fetchMixkitTrackById(id, cache) {
  const cached = cache?.get(String(id))
  if (cached) return cached
  return {
    id: String(id),
    title: `Mixkit ${id}`,
    artist: 'Mixkit',
    url: mixkitMp3Url(id),
    license: 'https://mixkit.co/license/#musicFree',
  }
}

async function buildMixkitCache(playlists) {
  const categories = [
    ...new Set([
      ...playlists.flatMap((p) => p.mixkitCategories ?? []),
      'pop',
      'dance-pop',
      'contemporary-r-and-b',
      'house',
      'edm',
      'hip-hop',
      'trap',
      'chillout',
      'lounge',
      'jazz',
      'bossa-nova',
      'acid-jazz',
      'film-and-orchestral',
      'contemporary-folk',
      'country',
    ]),
  ]
  const cache = new Map()

  for (const category of categories) {
    try {
      const tracks = await fetchMixkitCategory(category)
      for (const track of tracks) {
        cache.set(track.id, track)
      }
    } catch (err) {
      process.stdout.write(`  ⚠ cache ${category}: ${err.message}\n`)
    }
  }

  return cache
}

async function resolvePlaylistTracks(config, usedGlobally, mixkitCache) {
  const skipRe = config.skipPattern ?? SKIP_TITLE
  const limit = config.maxTracks ?? TRACKS_PER_PLAYLIST
  const selected = []

  for (const rawId of config.mixkitIds ?? []) {
    if (selected.length >= limit) break
    const id = String(rawId)
    if (usedGlobally.has(id)) continue
    const track = await fetchMixkitTrackById(id, mixkitCache)
    if (skipRe.test(track.title)) continue
    selected.push(track)
  }

  if (!config.curatedOnly) {
    const byId = new Map(selected.map((t) => [t.id, t]))
    for (const category of config.mixkitCategories ?? []) {
      if (selected.length >= limit) break
      try {
        const tracks = await fetchMixkitCategory(category)
        for (const track of tracks) {
          if (selected.length >= limit) break
          if (byId.has(track.id) || usedGlobally.has(track.id)) continue
          if (skipRe.test(track.title)) continue
          byId.set(track.id, track)
          selected.push(track)
        }
      } catch (err) {
        process.stdout.write(`  ⚠ kategoria ${category}: ${err.message}\n`)
      }
    }
  }

  for (const track of selected) {
    usedGlobally.add(track.id)
  }

  return selected
}

function hasBandcampSource(config) {
  return (config.bandcampAlbums?.length ?? 0) > 0
}

function displayTrackTitle(title) {
  return (title ?? '').replace(/\s*\(free\)\s*/gi, '').trim()
}

function normalizeTrackTitle(title) {
  return displayTrackTitle(title).toLowerCase()
}

function parseBandcampPage(html) {
  const match = html.match(/data-tralbum="([^"]+)"/)
  if (!match) throw new Error('brak metadanych Bandcamp (data-tralbum)')
  return JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'))
}

function licenseFromBandcampHtml(html) {
  return html.match(/creativecommons\.org\/licenses\/[^"']+/)?.[0] ?? 'see bandcamp page'
}

function isCommercialBandcampLicense(license) {
  return /creativecommons\.org\/licenses\/by\/\d/i.test(license) && !/by-nc/i.test(license)
}

/** Pobiera utwory z albumu Bandcamp (darmowe / name-your-price 0). */
function tracksFromBandcampAlbum(html, albumConfig) {
  const data = parseBandcampPage(html)
  const defaultArtist = albumConfig.artist ?? data.artist ?? 'Bandcamp'
  let license = albumConfig.license ?? licenseFromBandcampHtml(html)
  if (!albumConfig.artistConsent && !isCommercialBandcampLicense(license)) {
    throw new Error(`licencja ${license} nie pozwala na użytek komercyjny`)
  }
  if (albumConfig.artistConsent) {
    license = albumConfig.license ?? 'zgoda artysty'
  }
  const albumUrl = albumConfig.url

  const byTitle = new Map(
    (data.trackinfo ?? [])
      .filter((t) => t.file?.['mp3-128'])
      .map((t) => [normalizeTrackTitle(t.title), t]),
  )

  let selected = []
  if (albumConfig.trackTitles?.length) {
    for (const wanted of albumConfig.trackTitles) {
      const track = byTitle.get(normalizeTrackTitle(wanted))
      if (track) selected.push(track)
    }
  } else {
    selected = (data.trackinfo ?? []).filter((t) => t.file?.['mp3-128'])
    if (albumConfig.maxTracks) selected = selected.slice(0, albumConfig.maxTracks)
  }

  return selected.map((t) => ({
    title: displayTrackTitle(t.title),
    artist: defaultArtist,
    url: t.file['mp3-128'],
    bandcampAlbum: albumUrl,
    bandcampTrack: t.title_link ?? albumUrl,
    license,
  }))
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stderr = ''
    child.stderr?.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(stderr.trim() || `${cmd} exited with code ${code}`))
    })
  })
}

/** Pobiera audio z oficjalnego YouTube jako MP3 (wymaga: python -m yt_dlp, ffmpeg). */
async function downloadYoutubeMp3(videoId, destBase) {
  const url = `https://www.youtube.com/watch?v=${videoId}`
  await runCommand('python', [
    '-m',
    'yt_dlp',
    '--no-check-certificates',
    '-f',
    'ba[ext=m4a]/bestaudio',
    '--extract-audio',
    '--audio-format',
    'mp3',
    '--audio-quality',
    '5',
    '-o',
    `${destBase}.%(ext)s`,
    url,
  ])
}

async function loadTrzciamajkaSourceUrls() {
  try {
    const raw = await readFile(TRZCIAMAJKA_SOURCES_FILE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data.tracks) ? data.tracks : []
  } catch {
    return []
  }
}

async function ensureTrzciamajkaSourcesTemplate() {
  try {
    await readFile(TRZCIAMAJKA_SOURCES_FILE, 'utf8')
  } catch {
    const template = {
      note: 'Opcjonalne: bezpośrednie URL-e MP3 od artystów (po uzyskaniu zgody).',
      tracks: [
        {
          title: 'Przyklad',
          artist: 'BEZJAHZGH',
          url: 'https://example.com/utwor.mp3',
          license: 'zgoda artysty',
        },
      ],
    }
    await mkdir(dirname(TRZCIAMAJKA_SOURCES_FILE), { recursive: true })
    await writeFile(TRZCIAMAJKA_SOURCES_FILE, JSON.stringify(template, null, 2) + '\n', 'utf8')
  }
}

async function downloadTrzciamajkaTracks(playlistDir, manifest, startIndex, options = {}) {
  let index = startIndex
  const artistLicense = 'zgoda artysty — odtwarzanie w lokalu za zgodą zespołu'
  const { autoDownload = false } = options

  if (autoDownload) {
    process.stdout.write(`  ◆ Trzciamajka — YouTube (BEZJAHZGH, Roots Soldiers)\n`)
    for (const track of TRZCIAMAJKA_YOUTUBE) {
      const file = `${String(index + 1).padStart(2, '0')}-trzciamajka-${slugify(`${track.artist}-${track.title}`)}.mp3`
      const destBase = join(playlistDir, file.replace(/\.mp3$/, ''))
      try {
        process.stdout.write(`  ↓ ${track.title} — ${track.artist} (YouTube)\n`)
        await downloadYoutubeMp3(track.videoId, destBase)
        manifest.files.push({
          file,
          title: track.title,
          artist: track.artist,
          source: `https://www.youtube.com/watch?v=${track.videoId}`,
          youtubeId: track.videoId,
          license: artistLicense,
        })
        index++
      } catch (err) {
        process.stdout.write(`  ✗ ${track.title}: ${err.message}\n`)
      }
    }

    for (const album of TRZCIAMAJKA_BANDCAMP) {
      const vibe = album.vibe ?? ''
      process.stdout.write(`  ◆ Trzciamajka — Bandcamp ${album.url}${vibe ? ` (${vibe})` : ''}\n`)
      let tracks = []
      try {
        const html = await fetchText(album.url)
        tracks = tracksFromBandcampAlbum(html, album)
      } catch (err) {
        process.stdout.write(`  ✗ Bandcamp ${album.url}: ${err.message}\n`)
        continue
      }

      for (const track of tracks) {
        const file = `${String(index + 1).padStart(2, '0')}-trzciamajka-${slugify(`${track.artist}-${track.title}`)}.mp3`
        const dest = join(playlistDir, file)
        try {
          process.stdout.write(`  ↓ ${track.title} — ${track.artist} (Bandcamp)\n`)
          await downloadFile(track.url, dest)
          manifest.files.push({
            file,
            title: track.title,
            artist: track.artist,
            source: track.url,
            bandcampAlbum: track.bandcampAlbum,
            bandcampTrack: track.bandcampTrack,
            license: track.license,
          })
          index++
        } catch (err) {
          process.stdout.write(`  ✗ ${track.title}: ${err.message}\n`)
        }
      }
    }
  }

  const extraSources = await loadTrzciamajkaSourceUrls()
  const validExtras = extraSources.filter(
    (t) => t?.url && t.url.startsWith('http') && !t.url.includes('example.com'),
  )
  if (validExtras.length) {
    process.stdout.write(`  ◆ Trzciamajka — trzciamajka-sources.json (${validExtras.length} utw.)\n`)
    for (const track of validExtras) {
      const file = `${String(index + 1).padStart(2, '0')}-trzciamajka-${slugify(`${track.artist ?? 'artist'}-${track.title ?? 'track'}`)}.mp3`
      const dest = join(playlistDir, file)
      try {
        process.stdout.write(`  ↓ ${track.title} — ${track.artist}\n`)
        await downloadFile(track.url, dest)
        manifest.files.push({
          file,
          title: track.title,
          artist: track.artist,
          source: track.url,
          license: track.license ?? artistLicense,
        })
        index++
      } catch (err) {
        process.stdout.write(`  ✗ ${track.title}: ${err.message}\n`)
      }
    }
  }

  try {
    const names = (await readdir(TRZCIAMAJKA_INCOMING_DIR)).filter((n) => n.toLowerCase().endsWith('.mp3'))
    if (names.length) {
      process.stdout.write(`  ◆ Trzciamajka — folder trzciamajka-incoming/ (${names.length} pl.)\n`)
      for (const name of names.sort((a, b) => a.localeCompare(b, 'pl'))) {
        const file = `${String(index + 1).padStart(2, '0')}-trzciamajka-${slugify(name.replace(/\.mp3$/i, ''))}.mp3`
        const dest = join(playlistDir, file)
        await copyFile(join(TRZCIAMAJKA_INCOMING_DIR, name), dest)
        manifest.files.push({
          file,
          title: name.replace(/\.mp3$/i, ''),
          artist: 'Trzciamajka (lokalnie)',
          source: join(TRZCIAMAJKA_INCOMING_DIR, name),
          license: artistLicense,
        })
        process.stdout.write(`  ↓ ${name}\n`)
        index++
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      process.stdout.write(`  ✗ trzciamajka-incoming: ${err.message}\n`)
    }
  }

  return index
}

async function writePolskieGuide(playlistDir) {
  const guide = `# Polskie — reggae, dub, hip-hop

Utwory pobrane automatycznie mają licencję **CC0** lub **CC BY 4.0** — do użytku komercyjnego w lokalu.
Przy CC BY zostaw informację o autorze (np. w \`_manifest.json\`).

## Źródła w tej playliście

| Artysta | Styl | Licencja |
|---------|------|----------|
| HoliznaCC0 — *BASSIC* | polski hip-hop / funk | **CC0** |
| HoliznaRAPS — *When You See Me Now* | polski hip-hop | **CC0** |
| HoliznaCC0 — *Public Domain Lofi* | polski lo-fi | **CC0** |
| Jangwa — *Poland '24* | reggae / dancehall | **CC BY 4.0** |

Pełna lista plików: \`_manifest.json\`.

## Własne utwory

Wrzuć dowolne MP3 do tego folderu — panel je odtworzy po ponownym wybraniu katalogu \`lokalnie\`.

## Trzciamajka (opcjonalnie)

Automatyczne pobieranie z YouTube/Bandcamp **nie jest włączone domyślnie** (wymaga pewności co do praw).
Gdy masz zgodę artystów:

\`\`\`bash
npm run download:local-music -- --playlist polskie --with-trzciamajka
\`\`\`

Albo wrzuć MP3 do \`local-music/trzciamajka-incoming/\` i uruchom ponownie pobieranie playlisty \`polskie\`.

## Odświeżenie

\`\`\`bash
npm run download:local-music -- --playlist polskie --clean
\`\`\`
`
  await writeFile(join(playlistDir, 'README.md'), guide, 'utf8')
}

function fmaCommercialLicense(html, allowCcBy = false) {
  if (/CC0|Public Domain/i.test(html)) return 'CC0'
  if (allowCcBy && /Attribution 4\.0 International|CC BY 4\.0|creativecommons\.org\/licenses\/by\/4/i.test(html)) {
    return 'CC BY 4.0'
  }
  return null
}

function fmaTrackPathsFromAlbumHtml(html, albumUrl) {
  const albumPath = new URL(albumUrl).pathname.replace(/\/$/, '')
  const escaped = albumPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`${escaped}/[^/"]+/`, 'g')
  return [...new Set([...html.matchAll(re)].map((m) => m[0]))]
}

/** URL pliku MP3 ze strony utworu FMA. */
function mp3UrlFromFmaTrackHtml(html) {
  const match = html.match(/fileUrl":"(https:(?:\\\/|\/)[^"]+\.mp3)"/)
  if (!match) return null
  return match[1].replace(/\\\//g, '/')
}

function titleFromFmaTrackHtml(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i)
  if (!match) return null
  return match[1].replace(/\s*-\s*Free Music Archive\s*$/i, '').trim()
}

/** Pobiera listę MP3 z albumu FMA (scraping stron utworów). */
async function mp3TracksFromFmaAlbum(albumConfig) {
  const albumUrl = typeof albumConfig === 'string' ? albumConfig : albumConfig.url
  const maxTracks = typeof albumConfig === 'string' ? TRACKS_PER_PLAYLIST : (albumConfig.maxTracks ?? TRACKS_PER_PLAYLIST)
  const defaultArtist = typeof albumConfig === 'string' ? 'FMA' : (albumConfig.artist ?? 'FMA')

  const html = await fetchText(albumUrl)
  const allowCcBy = typeof albumConfig !== 'string' && albumConfig.allowCcBy
  const license = fmaCommercialLicense(html, allowCcBy)
  if (!license) {
    throw new Error(`brak licencji CC0 / CC BY na albumie ${albumUrl}`)
  }

  const trackPaths = fmaTrackPathsFromAlbumHtml(html, albumUrl)
  let pathsToUse = trackPaths
  if (typeof albumConfig !== 'string' && albumConfig.trackSlugs?.length) {
    pathsToUse = albumConfig.trackSlugs
      .map((slug) => trackPaths.find((path) => path.includes(slug)))
      .filter(Boolean)
  }

  const tracks = []

  if (pathsToUse.length === 0) {
    const directMp3 = mp3UrlFromFmaTrackHtml(html)
    if (directMp3) {
      tracks.push({
        url: directMp3,
        slug: new URL(albumUrl).pathname.split('/').filter(Boolean).pop() ?? 'track',
        title: titleFromFmaTrackHtml(html) ?? 'track',
        artist: defaultArtist,
        fmaTrack: albumUrl,
        fmaAlbum: albumUrl,
        license,
      })
      return tracks
    }
  }

  for (const path of pathsToUse) {
    if (tracks.length >= maxTracks) break
    await sleep(FMA_DELAY_MS)
    const trackUrl = `https://freemusicarchive.org${path}`
    try {
      const trackHtml = await fetchText(trackUrl)
      const mp3Url = mp3UrlFromFmaTrackHtml(trackHtml)
      if (!mp3Url) continue
      const slug = path.split('/').filter(Boolean).pop() ?? 'track'
      const title = titleFromFmaTrackHtml(trackHtml) ?? slug
      tracks.push({
        url: mp3Url,
        slug,
        title,
        artist: defaultArtist,
        fmaTrack: trackUrl,
        fmaAlbum: albumUrl,
        license,
      })
    } catch (err) {
      process.stdout.write(`  ✗ FMA ${path}: ${err.message}\n`)
    }
  }

  return tracks
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  await mkdir(dirname(destPath), { recursive: true })
  await pipeline(res.body, createWriteStream(destPath))
}

async function downloadPlaylist(playlistId, config, outDir, usedGlobally, mixkitCache, clean, withTrzciamajka) {
  const playlistDir = join(outDir, playlistId)
  await mkdir(playlistDir, { recursive: true })

  if (clean) {
    const wiped = await wipeMp3(playlistDir)
    if (wiped) process.stdout.write(`  🧹 usunięto ${wiped} starych MP3 (--clean)\n`)
  }

  const manifest = {
    id: playlistId,
    label: config.label,
    license:
      config.license ??
      'Mixkit License — royalty-free, bez atrybucji (mixkit.co/license)',
    source: config.source ?? 'https://mixkit.co/free-stock-music/',
    files: [],
    fmaAlbums: config.fmaAlbums ?? [],
    bandcampAlbums: config.bandcampAlbums ?? [],
    trzciamajkaScene: playlistId === 'polskie' && withTrzciamajka ? TRZCIAMAJKA_SCENE : undefined,
    trzciamajkaYoutube: playlistId === 'polskie' && withTrzciamajka ? TRZCIAMAJKA_YOUTUBE : undefined,
    trzciamajkaBandcamp: playlistId === 'polskie' && withTrzciamajka ? TRZCIAMAJKA_BANDCAMP : undefined,
  }

  let index = 0

  if (hasMixkitSource(config)) {
    process.stdout.write(`  szukam utworów (Mixkit)…\n`)
    const tracks = await resolvePlaylistTracks(config, usedGlobally, mixkitCache)

    for (const track of tracks) {
      const file = `${String(index + 1).padStart(2, '0')}-${slugify(track.title)}.mp3`
      const dest = join(playlistDir, file)
      try {
        process.stdout.write(`  ↓ ${track.title} — ${track.artist}\n`)
        await downloadFile(track.url, dest)
        manifest.files.push({
          file,
          title: track.title,
          artist: track.artist,
          mixkitId: track.id,
          source: track.url,
          license: track.license,
        })
        index++
      } catch (err) {
        process.stdout.write(`  ✗ ${track.title}: ${err.message}\n`)
      }
    }
  }

  if (hasFmaSource(config)) {
    for (const album of config.fmaAlbums) {
      const albumUrl = typeof album === 'string' ? album : album.url
      const vibe = typeof album === 'string' ? '' : (album.vibe ?? '')
      process.stdout.write(`  ◆ FMA ${albumUrl}${vibe ? ` (${vibe})` : ''}\n`)
      let tracks = []
      try {
        tracks = await mp3TracksFromFmaAlbum(album)
      } catch (err) {
        process.stdout.write(`  ✗ FMA album: ${err.message}\n`)
        continue
      }

      for (const track of tracks) {
        const file = `${String(index + 1).padStart(2, '0')}-${slugify(track.title)}.mp3`
        const dest = join(playlistDir, file)
        try {
          process.stdout.write(`  ↓ ${track.title} — ${track.artist}\n`)
          await downloadFile(track.url, dest)
          manifest.files.push({
            file,
            title: track.title,
            artist: track.artist,
            source: track.url,
            fmaAlbum: track.fmaAlbum,
            fmaTrack: track.fmaTrack,
            license: 'CC0 1.0 Universal',
          })
          index++
          await sleep(FMA_DELAY_MS)
        } catch (err) {
          process.stdout.write(`  ✗ ${track.title}: ${err.message}\n`)
        }
      }
    }
  }

  if (hasBandcampSource(config)) {
    for (const album of config.bandcampAlbums) {
      const vibe = album.vibe ?? ''
      process.stdout.write(`  ◆ Bandcamp ${album.url}${vibe ? ` (${vibe})` : ''}\n`)
      let tracks = []
      try {
        const html = await fetchText(album.url)
        tracks = tracksFromBandcampAlbum(html, album)
      } catch (err) {
        process.stdout.write(`  ✗ Bandcamp album: ${err.message}\n`)
        continue
      }

      for (const track of tracks) {
        const file = `${String(index + 1).padStart(2, '0')}-${slugify(track.title)}.mp3`
        const dest = join(playlistDir, file)
        try {
          process.stdout.write(`  ↓ ${track.title} — ${track.artist}\n`)
          await downloadFile(track.url, dest)
          manifest.files.push({
            file,
            title: track.title,
            artist: track.artist,
            source: track.url,
            bandcampAlbum: track.bandcampAlbum,
            bandcampTrack: track.bandcampTrack,
            license: track.license,
          })
          index++
        } catch (err) {
          process.stdout.write(`  ✗ ${track.title}: ${err.message}\n`)
        }
      }
    }
  }

  if (playlistId === 'polskie') {
    await ensureTrzciamajkaSourcesTemplate()
    index = await downloadTrzciamajkaTracks(playlistDir, manifest, index, { autoDownload: withTrzciamajka })
    await writePolskieGuide(playlistDir)
  }

  await writeFile(join(playlistDir, '_manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  const synced = await syncFolderToManifest(playlistDir, manifest)
  if (synced.orphans || synced.dupes) {
    process.stdout.write(
      `  🧹 porządki: −${synced.orphans} osieroc., −${synced.dupes} dubli → ${synced.kept} w manifeście\n`,
    )
  }

  return manifest.files.length
}

async function main() {
  const { outDir, playlistFilter, clean, withTrzciamajka } = parseArgs(process.argv.slice(2))
  const playlistEntries = Object.entries(PLAYLISTS).filter(
    ([id]) => !playlistFilter || id === playlistFilter,
  )

  if (playlistFilter && playlistEntries.length === 0) {
    throw new Error(`Nieznana playlista: ${playlistFilter}`)
  }

  process.stdout.write(`\nPobieranie muzyki do: ${outDir}\n`)
  if (playlistFilter) {
    process.stdout.write(`(tylko playlista: ${playlistFilter})\n`)
  }
  if (clean) {
    process.stdout.write(`(tryb --clean: kasuje MP3 przed pobraniem)\n`)
  }
  if (withTrzciamajka) {
    process.stdout.write(`(flaga --with-trzciamajka: pobieranie z YouTube/Bandcamp)\n`)
  }
  if (!playlistFilter) {
    process.stdout.write(`(ok. ${TRACKS_PER_PLAYLIST} utworów Mixkit na playlistę, bez duplikatów)\n`)
  }
  process.stdout.write('\n')

  const usedGlobally = new Set()
  let total = 0

  const needsMixkit = playlistEntries.some(([, config]) => hasMixkitSource(config))
  let mixkitCache = new Map()
  if (needsMixkit) {
    process.stdout.write('Budowanie katalogu Mixkit…\n')
    mixkitCache = await buildMixkitCache(playlistEntries.map(([, config]) => config))
    process.stdout.write(`  ${mixkitCache.size} utworów w cache\n\n`)
  }

  for (const [id, config] of playlistEntries) {
    process.stdout.write(`▶ ${config.label} (${id}/)\n`)
    total += await downloadPlaylist(id, config, outDir, usedGlobally, mixkitCache, clean, withTrzciamajka)
    process.stdout.write(`  ✓ ${id}: gotowe\n\n`)
  }

  const readme = `# Muzyka lokalna

Wygenerowano: ${new Date().toISOString()}

Źródła:
- [Mixkit](https://mixkit.co/free-stock-music/) — royalty-free (większość playlist)
- [Free Music Archive](https://freemusicarchive.org/) + [Bandcamp](https://bandcamp.com/) — \`polskie/\` (CC0 / CC BY)

## Foldery = playlisty w panelu (Niekomercyjne → Lokalnie)

| Folder | Panel |
|--------|-------|
${Object.entries(PLAYLISTS)
  .map(([id, c]) => `| \`${id}/\` | ${c.label} |`)
  .join('\n')}

## Odtwarzanie w panelu

1. Na **tym samym komputerze** co pliki MP3 otwórz panel w Chrome lub Edge.
2. **Niekomercyjne** → **Lokalnie** → **Wybierz folder z muzyką** → wskaż ten katalog (\`lokalnie\`).
3. Kliknij playlistę — utwory lecą **losowo** (inna kolejność przy każdym starcie).

## Własne utwory

Wrzuć dowolne MP3 do podfolderu (np. \`polskie/moj-utwor.mp3\`) — panel je odtworzy po ponownym wybraniu folderu.

## Odświeżenie biblioteki

\`\`\`bash
npm run download:local-music
npm run clean:local-music
npm run download:local-music -- --playlist polskie --clean
\`\`\`

Potem skopiuj zaktualizowany folder na komputer w lokalu.
`

  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'README.md'), readme, 'utf8')

  process.stdout.write(`\n✅ Pobrano ${total} plików MP3.\n`)
  process.stdout.write(`📁 ${outDir}\n\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

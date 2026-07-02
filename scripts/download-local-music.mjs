#!/usr/bin/env node
/**
 * Pobiera muzykę royalty-free (Mixkit) do folderów Lokalnie w panelu.
 *
 * Użycie:
 *   npm run download:local-music
 *   node scripts/download-local-music.mjs --out ./local-music/lokalnie
 *
 * Po pobraniu w panelu: Niekomercyjne → Lokalnie → „Wybierz folder z muzyką”.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const UA = 'MagazynBialaLocalMusic/2.0 (https://github.com/DamianMalenta/magazyn_biala)'
const TRACKS_PER_PLAYLIST = 12

/** Słowa w tytule = raczej nie do lokalu gastronomicznego. */
const SKIP_TITLE = /\b(horror|fright|nightmare|scary|thriller|piano horror|hard techno|techno fight|danger)\b/i

/**
 * Playlisty = foldery w panelu.
 * mixkitCategories — gatunki z mixkit.co (JSON-LD na stronie kategorii).
 * mixkitIds — ręcznie dobrane utwory (nadpisują / uzupełniają listę).
 */
const PLAYLISTS = {
  'pop-radio': {
    label: 'Pop & Radio — młodzież',
    mixkitCategories: ['pop', 'contemporary-r-and-b', 'dance-pop'],
    mixkitIds: [705, 931, 1001, 476],
  },
  'dance-edm': {
    label: 'Dance & EDM',
    mixkitCategories: ['house', 'edm', 'dance'],
    mixkitIds: [371, 623, 744, 181, 124],
  },
  'hiphop-trap': {
    label: 'Hip-Hop & Trap',
    mixkitCategories: ['hip-hop', 'trap', 'contemporary-r-and-b'],
    mixkitIds: [738, 400, 416, 305],
  },
  'chill-pop': {
    label: 'Chill Pop',
    mixkitCategories: ['chillout', 'lounge', 'lo-fi'],
    mixkitIds: [443, 695, 27, 175, 640],
  },
  'lunch-jazz': {
    label: 'Lunch & Jazz',
    mixkitCategories: ['jazz', 'bossa-nova', 'acid-jazz'],
    mixkitIds: [493, 39, 752, 89, 528, 40, 494, 808],
    skipPattern: /\b(horror|fright|hard techno|comedy)\b/i,
  },
  kolacja: {
    label: 'Kolacja',
    mixkitCategories: ['film-and-orchestral', 'bossa-nova', 'jazz'],
    mixkitIds: [518, 526, 652, 765, 664, 647, 700, 234, 105, 475],
    skipPattern: /\b(hip hop|trap|techno|horror|fright|hard|fight|comedy|humorous|ironic|phat)\b/i,
  },
  akustyczna: {
    label: 'Akustyczna',
    mixkitCategories: ['contemporary-folk', 'acoustic', 'country'],
    mixkitIds: [12, 87, 797, 879, 1033, 1112],
  },
}

function parseArgs(argv) {
  const outIdx = argv.indexOf('--out')
  const outDir = outIdx >= 0 ? argv[outIdx + 1] : join(__dirname, '..', 'local-music', 'lokalnie')
  return { outDir }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 55)
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
    ...new Set(playlists.flatMap((p) => p.mixkitCategories ?? [])),
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
  const byId = new Map()
  const skipRe = config.skipPattern ?? SKIP_TITLE

  for (const rawId of config.mixkitIds ?? []) {
    const id = String(rawId)
    byId.set(id, await fetchMixkitTrackById(id, mixkitCache))
  }

  for (const category of config.mixkitCategories ?? []) {
    try {
      const tracks = await fetchMixkitCategory(category)
      for (const track of tracks) {
        if (!byId.has(track.id)) byId.set(track.id, track)
      }
    } catch (err) {
      process.stdout.write(`  ⚠ kategoria ${category}: ${err.message}\n`)
    }
  }

  const selected = []
  for (const track of byId.values()) {
    if (usedGlobally.has(track.id)) continue
    if (skipRe.test(track.title)) continue
    selected.push(track)
    if (selected.length >= TRACKS_PER_PLAYLIST) break
  }

  for (const track of selected) {
    usedGlobally.add(track.id)
  }

  return selected
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  await mkdir(dirname(destPath), { recursive: true })
  await pipeline(res.body, createWriteStream(destPath))
}

async function downloadPlaylist(playlistId, config, outDir, usedGlobally, mixkitCache) {
  const playlistDir = join(outDir, playlistId)
  await mkdir(playlistDir, { recursive: true })

  process.stdout.write(`  szukam utworów (Mixkit)…\n`)
  const tracks = await resolvePlaylistTracks(config, usedGlobally, mixkitCache)

  const manifest = {
    id: playlistId,
    label: config.label,
    license: 'Mixkit License — royalty-free, bez atrybucji (mixkit.co/license)',
    source: 'https://mixkit.co/free-stock-music/',
    files: [],
  }

  let index = 0
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

  await writeFile(join(playlistDir, '_manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  return manifest.files.length
}

async function main() {
  const { outDir } = parseArgs(process.argv.slice(2))
  process.stdout.write(`\nPobieranie muzyki Mixkit do: ${outDir}\n`)
  process.stdout.write(`(ok. ${TRACKS_PER_PLAYLIST} utworów na playlistę, bez duplikatów między folderami)\n\n`)

  const usedGlobally = new Set()
  let total = 0

  process.stdout.write('Budowanie katalogu Mixkit…\n')
  const mixkitCache = await buildMixkitCache(Object.values(PLAYLISTS))
  process.stdout.write(`  ${mixkitCache.size} utworów w cache\n\n`)

  for (const [id, config] of Object.entries(PLAYLISTS)) {
    process.stdout.write(`▶ ${config.label} (${id}/)\n`)
    total += await downloadPlaylist(id, config, outDir, usedGlobally, mixkitCache)
    process.stdout.write(`  ✓ ${id}: gotowe\n\n`)
  }

  const readme = `# Muzyka lokalna (Mixkit)

Wygenerowano: ${new Date().toISOString()}

Źródło: [Mixkit](https://mixkit.co/free-stock-music/) — royalty-free, do użytku komercyjnego w lokalu (zgodnie z licencją Mixkit).

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

Wrzuć dowolne MP3 do podfolderu (np. \`lunch-jazz/moj-utwor.mp3\`) — panel je odtworzy po ponownym wybraniu folderu.

## Odświeżenie biblioteki

\`\`\`bash
npm run download:local-music
\`\`\`

Potem skopiuj zaktualizowany folder na komputer w lokalu.
`

  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'README.md'), readme, 'utf8')

  process.stdout.write(`\n✅ Pobrano ${total} plików MP3 z Mixkit.\n`)
  process.stdout.write(`📁 ${outDir}\n\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Pobiera muzykę CC0 do folderów pod ShuffleCast (kategoria Lokalnie w panelu).
 *
 * Użycie:
 *   npm run download:local-music
 *   node scripts/download-local-music.mjs --out ./local-music/lokalnie
 *
 * Po pobraniu skopiuj foldery na PC z ShuffleCast:
 *   local-music/lokalnie/pop-radio/*.mp3  →  music/pop-radio/
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const UA = 'MagazynBialaLocalMusic/1.0 (https://github.com/DamianMalenta/magazyn_biala)'

/** Playlisty = foldery ShuffleCast = podkategoria Lokalnie w panelu. */
const PLAYLISTS = {
  'pop-radio': {
    label: 'Pop & Radio — młodzież',
    ogaPages: [
      '/content/5-chiptunes-action',
      '/content/town-theme-rpg',
      '/content/menu-music',
      '/content/cyberpunk-moonlight-sonata',
    ],
    tracks: [
      {
        file: 'relaxing-aug-2021.mp3',
        url: 'https://opengameart.org/sites/default/files/relaxing_aug_4_2021_1.mp3',
        artist: 'Alex McCulloch',
      },
    ],
    fmaAlbums: [
      'https://freemusicarchive.org/music/holiznacc0/power-pop',
      'https://freemusicarchive.org/music/Loyalty_Freak_Music/ROLLER_DISCO_DANCE_DANCE',
    ],
  },
  'dance-edm': {
    label: 'Dance & EDM',
    ogaPages: ['/content/fast-fight-battle-music', '/content/awake-megawall-10'],
    tracks: [],
    fmaAlbums: [
      'https://freemusicarchive.org/music/Loyalty_Freak_Music/ROBOT_DANCE_',
      'https://freemusicarchive.org/music/holiznacc0/phonk-aura-farming',
    ],
  },
  'hiphop-trap': {
    label: 'Hip-Hop & Trap',
    ogaPages: ['/content/5-chiptunes-action'],
    tracks: [],
    fmaAlbums: ['https://freemusicarchive.org/music/holiznacc0/interstellar-pop-songs'],
  },
  'chill-pop': {
    label: 'Chill Pop',
    ogaPages: [
      '/content/the-field-of-dreams',
      '/content/another-space-background-track',
      '/content/background-space-track',
      '/content/snowfall',
    ],
    tracks: [],
    fmaAlbums: ['https://freemusicarchive.org/music/holiznacc0/public-domain-lofi'],
  },
  'lunch-jazz': {
    label: 'Lunch & Jazz',
    ogaPages: ['/content/bossa-nova', '/content/enchanted-tiki-86'],
    tracks: [],
    fmaAlbums: [
      'https://freemusicarchive.org/music/John_Bartmann/picnic-on-the-seine-euro-vacation-sounds',
      'https://freemusicarchive.org/music/holiznacc0/busted-guitar-jazz',
    ],
  },
  kolacja: {
    label: 'Kolacja',
    ogaPages: ['/content/bossa-nova', '/content/mysterious-ambience-song21'],
    tracks: [],
    fmaAlbums: [
      'https://freemusicarchive.org/music/John_Bartmann/hot-equatorial-night',
      'https://freemusicarchive.org/music/Frederic_Lardon_feat_Laura_Palme/Jazz__la_cool_pour_les_vacances_sur_la_plage_ou__la_montagne_1678',
    ],
  },
  akustyczna: {
    label: 'Akustyczna',
    ogaPages: ['/content/the-field-of-dreams', '/content/rain-and-thunders'],
    tracks: [],
    fmaAlbums: ['https://freemusicarchive.org/music/Monplaisir/Free_To_Use'],
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
    .slice(0, 60)
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return res.text()
}

/** Wyciąga pełne pliki MP3 ze strony OpenGameArt (CC0). */
async function mp3UrlsFromOga(contentPath) {
  const html = await fetchText(`https://opengameart.org${contentPath}`)
  const found = new Set()
  for (const match of html.matchAll(/https:\/\/opengameart\.org\/sites\/default\/files\/[^"'\s<>]+\.mp3/gi)) {
    const url = decodeURIComponent(match[0])
    if (url.includes('/styles/') || url.includes('audio_preview')) continue
    found.add(url)
  }
  return [...found]
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  await mkdir(dirname(destPath), { recursive: true })
  await pipeline(res.body, createWriteStream(destPath))
}

async function downloadPlaylist(playlistId, config, outDir) {
  const playlistDir = join(outDir, playlistId)
  await mkdir(playlistDir, { recursive: true })

  const manifest = {
    id: playlistId,
    label: config.label,
    license: 'CC0 / royalty-free — sprawdź licencję każdego utworu',
    files: [],
    fmaManual: config.fmaAlbums ?? [],
  }

  let index = 0

  for (const track of config.tracks ?? []) {
    const dest = join(playlistDir, track.file)
    try {
      process.stdout.write(`  ↓ ${track.file}\n`)
      await downloadFile(track.url, dest)
      manifest.files.push({ file: track.file, source: track.url, artist: track.artist })
      index++
    } catch (err) {
      process.stdout.write(`  ✗ ${track.file}: ${err.message}\n`)
    }
  }

  for (const page of config.ogaPages ?? []) {
    let urls = []
    try {
      urls = await mp3UrlsFromOga(page)
    } catch (err) {
      process.stdout.write(`  ✗ OGA ${page}: ${err.message}\n`)
      continue
    }

    for (const url of urls) {
      const base = decodeURIComponent(url.split('/').pop() ?? `track-${index}.mp3`)
      const file = `${String(index + 1).padStart(2, '0')}-${slugify(base.replace(/\.mp3$/i, ''))}.mp3`
      const dest = join(playlistDir, file)
      try {
        process.stdout.write(`  ↓ ${file}\n`)
        await downloadFile(url, dest)
        manifest.files.push({ file, source: url, ogaPage: page })
        index++
      } catch (err) {
        process.stdout.write(`  ✗ ${file}: ${err.message}\n`)
      }
    }
  }

  await writeFile(join(playlistDir, '_manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  if (config.fmaAlbums?.length) {
    process.stdout.write(`  ℹ FMA — pobierz ręcznie albumy (przycisk ↓ na stronie):\n`)
    for (const album of config.fmaAlbums) {
      process.stdout.write(`      ${album}\n`)
    }
  }

  return manifest.files.length
}

async function main() {
  const { outDir } = parseArgs(process.argv.slice(2))
  process.stdout.write(`\nPobieranie muzyki CC0 do: ${outDir}\n\n`)

  let total = 0
  for (const [id, config] of Object.entries(PLAYLISTS)) {
    process.stdout.write(`▶ ${config.label} (${id}/)\n`)
    total += await downloadPlaylist(id, config, outDir)
    process.stdout.write(`  ✓ ${id}: gotowe\n\n`)
  }

  const readme = `# Muzyka lokalna (CC0)

Wygenerowano: ${new Date().toISOString()}

## Foldery = playlisty w panelu (Niekomercyjne → Lokalnie)

| Folder | Panel |
|--------|-------|
${Object.entries(PLAYLISTS)
  .map(([id, c]) => `| \`${id}/\` | ${c.label} |`)
  .join('\n')}

## ShuffleCast

Skopiuj zawartość każdego folderu do \`music/<nazwa-folderu>/\` na PC z ShuffleCast.

Strumień: \`http://<IP-PC>:8000/<folder>.mp3\`

Domyślny adres w panelu: \`http://192.168.1.50:8000\` — zmień w \`src/start/lib/musicUtils.ts\` (\`LOCAL_STREAM_HOST\`).

## FMA (Free Music Archive)

Skrypt pobrał utwory z OpenGameArt. Dodatkowe albumy CC0 pobierz ręcznie z FMA
(przycisk pobierania na stronie albumu) i wrzuć MP3 do odpowiedniego folderu.
Lista albumów jest w pliku \`_manifest.json\` w każdym folderze.

## Licencja

Używaj wyłącznie utworów CC0 lub royalty-free do użytku komercyjnego w lokalu.
`

  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'README.md'), readme, 'utf8')

  process.stdout.write(`\n✅ Pobrano ${total} plików MP3.\n`)
  process.stdout.write(`📁 ${outDir}\n`)
  process.stdout.write(`📖 Uzupełnij playlisty albumami FMA (instrukcja w README.md).\n\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

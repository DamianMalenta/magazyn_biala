#!/usr/bin/env node
/**
 * Porządkuje foldery w local-music/lokalnie:
 * - usuwa MP3 spoza _manifest.json
 * - usuwa duplikaty bajtowe (zostawia wersję z manifestu)
 *
 *   npm run clean:local-music
 *   node scripts/clean-local-music.mjs --playlist polskie
 */

import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncFolderToManifest } from './local-music-cleanup.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_OUT = join(__dirname, '..', 'local-music', 'lokalnie')

function parseArgs(argv) {
  const outIdx = argv.indexOf('--out')
  const playlistIdx = argv.indexOf('--playlist')
  return {
    outDir: outIdx >= 0 ? argv[outIdx + 1] : DEFAULT_OUT,
    playlistFilter: playlistIdx >= 0 ? argv[playlistIdx + 1] : null,
  }
}

async function cleanPlaylist(playlistId, outDir) {
  const playlistDir = join(outDir, playlistId)
  let manifest
  try {
    manifest = JSON.parse(await readFile(join(playlistDir, '_manifest.json'), 'utf8'))
  } catch {
    process.stdout.write(`  ⊘ ${playlistId}: brak _manifest.json — pominięto\n`)
    return null
  }

  const before = (await readdir(playlistDir)).filter((f) => f.endsWith('.mp3')).length
  const result = await syncFolderToManifest(playlistDir, manifest)
  const after = before - result.orphans - result.dupes
  process.stdout.write(
    `  ✓ ${playlistId}: ${before} → ${after} utw. (usunięto ${result.orphans} osieroc., ${result.dupes} dubli)\n`,
  )
  return result
}

async function main() {
  const { outDir, playlistFilter } = parseArgs(process.argv.slice(2))
  const playlists = (await readdir(outDir)).filter((name) => !name.startsWith('.'))
  const targets = playlistFilter ? playlists.filter((id) => id === playlistFilter) : playlists

  if (playlistFilter && targets.length === 0) {
    throw new Error(`Nieznana playlista: ${playlistFilter}`)
  }

  process.stdout.write(`\nPorządkowanie: ${outDir}\n\n`)
  let totalOrphans = 0
  let totalDupes = 0

  for (const id of targets.sort()) {
    const result = await cleanPlaylist(id, outDir)
    if (result) {
      totalOrphans += result.orphans
      totalDupes += result.dupes
    }
  }

  process.stdout.write(
    `\n✅ Gotowe. Usunięto ${totalOrphans} osieroconych i ${totalDupes} duplikatów.\n\n`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

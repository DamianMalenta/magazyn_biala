import { createHash } from 'node:crypto'
import { readdir, readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'

/** Usuwa pliki MP3 spoza listy z manifestu. */
export async function pruneOrphanMp3(playlistDir, keepFiles) {
  const keep = new Set(keepFiles)
  let removed = 0
  for (const name of await readdir(playlistDir)) {
    if (!name.endsWith('.mp3') || name.startsWith('_')) continue
    if (keep.has(name)) continue
    await unlink(join(playlistDir, name))
    removed++
  }
  return removed
}

/** Usuwa duplikaty bajtowe; zostawia plik z manifestu lub pierwszy alfabetycznie. */
export async function dedupeMp3ByHash(playlistDir, manifestFiles = []) {
  const manifestSet = new Set(manifestFiles)
  const mp3s = (await readdir(playlistDir)).filter((f) => f.endsWith('.mp3'))
  const byHash = new Map()

  for (const file of mp3s) {
    const buf = await readFile(join(playlistDir, file))
    const hash = createHash('md5').update(buf).digest('hex')
    if (!byHash.has(hash)) byHash.set(hash, [])
    byHash.get(hash).push(file)
  }

  let removed = 0
  for (const group of byHash.values()) {
    if (group.length <= 1) continue
    const sorted = [...group].sort((a, b) => a.localeCompare(b, 'pl'))
    const keeper = sorted.find((f) => manifestSet.has(f)) ?? sorted[0]
    for (const file of group) {
      if (file === keeper) continue
      await unlink(join(playlistDir, file))
      removed++
    }
  }
  return removed
}

export async function wipeMp3(playlistDir) {
  let removed = 0
  for (const name of await readdir(playlistDir)) {
    if (!name.endsWith('.mp3')) continue
    await unlink(join(playlistDir, name))
    removed++
  }
  return removed
}

/** Synchronizuje folder z manifestem (osierocone + duplikaty). */
export async function syncFolderToManifest(playlistDir, manifest) {
  const files = (manifest.files ?? []).map((entry) => entry.file)
  const orphans = await pruneOrphanMp3(playlistDir, files)
  const dupes = await dedupeMp3ByHash(playlistDir, files)
  return { orphans, dupes, kept: files.length }
}

/** Odtwarzanie MP3 z folderu na tym samym komputerze (File System Access API). */

const DB_NAME = 'biala-local-music'
const DB_VERSION = 1
const STORE = 'handles'
const ROOT_KEY = 'music-root'

const PLAYLIST_LABELS: Record<string, string> = {
  'pop-radio': 'Pop & Radio — młodzież',
  'dance-edm': 'Dance & EDM',
  'hiphop-trap': 'Hip-Hop & Trap',
  'chill-pop': 'Chill Pop',
  'lunch-jazz': 'Lunch & Jazz',
  kolacja: 'Kolacja',
  akustyczna: 'Akustyczna',
}

export interface LocalPlaylistInfo {
  id: string
  label: string
  trackCount: number
}

export interface LocalMusicStatus {
  connected: boolean
  folderName: string | null
  playlists: LocalPlaylistInfo[]
  totalTracks: number
  supported: boolean
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB error'))
  })
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB read error'))
  })
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write error'))
  })
}

export function isLocalFileSystemSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

export function playlistLabel(folderId: string): string {
  return PLAYLIST_LABELS[folderId] ?? folderId
}

export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

export async function ensureReadPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const perm = await handle.queryPermission({ mode: 'read' })
  if (perm === 'granted') return true
  if (perm === 'denied') return false
  return (await handle.requestPermission({ mode: 'read' })) === 'granted'
}

export async function loadStoredRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!isLocalFileSystemSupported()) return null
  const handle = await idbGet<FileSystemDirectoryHandle>(ROOT_KEY)
  if (!handle) return null
  const ok = await ensureReadPermission(handle)
  return ok ? handle : null
}

export async function saveRootHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await idbSet(ROOT_KEY, handle)
}

export async function pickMusicRootFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isLocalFileSystemSupported()) return null
  const handle = await window.showDirectoryPicker({ mode: 'read' })
  const ok = await ensureReadPermission(handle)
  if (!ok) return null
  await saveRootHandle(handle)
  return handle
}

async function mp3FilesInFolder(folder: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = []
  for await (const entry of folder.values()) {
    if (entry.kind !== 'file') continue
    const fileHandle = entry as FileSystemFileHandle
    if (!fileHandle.name.toLowerCase().endsWith('.mp3')) continue
    if (fileHandle.name.startsWith('_')) continue
    files.push(await fileHandle.getFile())
  }
  return files.sort((a, b) => a.name.localeCompare(b.name, 'pl'))
}

export async function scanLocalPlaylists(root: FileSystemDirectoryHandle): Promise<LocalPlaylistInfo[]> {
  const playlists: LocalPlaylistInfo[] = []

  for await (const entry of root.values()) {
    if (entry.kind !== 'directory') continue
    const dir = entry as FileSystemDirectoryHandle
    const tracks = await mp3FilesInFolder(dir)
    if (tracks.length === 0) continue
    playlists.push({
      id: dir.name,
      label: playlistLabel(dir.name),
      trackCount: tracks.length,
    })
  }

  return playlists.sort((a, b) => a.label.localeCompare(b.label, 'pl'))
}

export async function listPlaylistTracks(
  root: FileSystemDirectoryHandle,
  playlistId: string,
): Promise<File[]> {
  const folder = await root.getDirectoryHandle(playlistId)
  return mp3FilesInFolder(folder)
}

export async function getLocalMusicStatus(root: FileSystemDirectoryHandle | null): Promise<LocalMusicStatus> {
  const supported = isLocalFileSystemSupported()
  if (!supported || !root) {
    return { connected: false, folderName: null, playlists: [], totalTracks: 0, supported }
  }

  const playlists = await scanLocalPlaylists(root)
  return {
    connected: playlists.length > 0,
    folderName: root.name,
    playlists,
    totalTracks: playlists.reduce((sum, p) => sum + p.trackCount, 0),
    supported,
  }
}

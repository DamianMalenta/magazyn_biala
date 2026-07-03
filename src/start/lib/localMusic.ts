/** Odtwarzanie MP3 z folderu na tym samym komputerze (File System Access API). */

const DB_NAME = 'biala-local-music'
const DB_VERSION = 1
const STORE = 'handles'
const ROOT_KEY = 'music-root'
const FOLDER_NAME_KEY = 'startpage-music-local-folder-name'

const PLAYLIST_LABELS: Record<string, string> = {
  'pop-radio': 'Pop & Radio — młodzież',
  'dance-edm': 'Dance & EDM',
  'hiphop-trap': 'Hip-Hop & Trap',
  'chill-pop': 'Chill Pop',
  'lunch-jazz': 'Lunch & Jazz',
  kolacja: 'Kolacja',
  akustyczna: 'Akustyczna',
  polskie: 'Polskie',
}

export type LocalMusicPermission = 'granted' | 'prompt' | 'denied' | 'none'

export interface LocalPlaylistInfo {
  id: string
  label: string
  trackCount: number
}

export interface LocalMusicStatus {
  connected: boolean
  /** Aktualnie odczytana nazwa folderu (gdy mamy uprawnienia). */
  folderName: string | null
  /** Zapamiętana nazwa — widoczna też po restarcie, zanim przywrócisz dostęp. */
  rememberedFolderName: string | null
  permission: LocalMusicPermission
  playlists: LocalPlaylistInfo[]
  totalTracks: number
  supported: boolean
}

export interface LocalMusicRoot {
  handle: FileSystemDirectoryHandle | null
  permission: LocalMusicPermission
  rememberedFolderName: string | null
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

export function loadRememberedFolderName(): string | null {
  try {
    return localStorage.getItem(FOLDER_NAME_KEY)
  } catch {
    return null
  }
}

export function saveRememberedFolderName(name: string): void {
  try {
    localStorage.setItem(FOLDER_NAME_KEY, name)
  } catch {
    /* ignore */
  }
}

export function clearRememberedFolderName(): void {
  try {
    localStorage.removeItem(FOLDER_NAME_KEY)
  } catch {
    /* ignore */
  }
}

export async function readStoredRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!isLocalFileSystemSupported()) return null
  return idbGet<FileSystemDirectoryHandle>(ROOT_KEY)
}

export async function queryRootPermission(
  handle: FileSystemDirectoryHandle,
): Promise<PermissionState> {
  return handle.queryPermission({ mode: 'read' })
}

export async function requestRootPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  return (await handle.requestPermission({ mode: 'read' })) === 'granted'
}

function emptyStatus(overrides: Partial<LocalMusicStatus> = {}): LocalMusicStatus {
  return {
    connected: false,
    folderName: null,
    rememberedFolderName: loadRememberedFolderName(),
    permission: 'none',
    playlists: [],
    totalTracks: 0,
    supported: isLocalFileSystemSupported(),
    ...overrides,
  }
}

/** Bez żądania uprawnień — bezpieczne przy starcie strony (bez kliknięcia użytkownika). */
export async function resolveLocalMusicRoot(options?: {
  requestIfNeeded?: boolean
}): Promise<LocalMusicRoot> {
  if (!isLocalFileSystemSupported()) {
    return { handle: null, permission: 'none', rememberedFolderName: loadRememberedFolderName() }
  }

  const stored = await readStoredRootHandle()
  const remembered = stored?.name ?? loadRememberedFolderName()

  if (!stored) {
    return { handle: null, permission: 'none', rememberedFolderName: remembered }
  }

  let perm = await queryRootPermission(stored)

  if (perm === 'prompt' && options?.requestIfNeeded) {
    perm = (await requestRootPermission(stored)) ? 'granted' : 'denied'
  }

  if (perm === 'granted') {
    return { handle: stored, permission: 'granted', rememberedFolderName: stored.name }
  }

  if (perm === 'denied') {
    return { handle: null, permission: 'denied', rememberedFolderName: remembered }
  }

  // Folder zapisany w IndexedDB, ale przeglądarka czeka na kliknięcie (typowe po restarcie PC).
  return { handle: null, permission: 'prompt', rememberedFolderName: remembered }
}

export async function saveRootHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await idbSet(ROOT_KEY, handle)
  saveRememberedFolderName(handle.name)
}

export async function pickMusicRootFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isLocalFileSystemSupported()) return null
  const handle = await window.showDirectoryPicker({ mode: 'read' })
  const ok = await requestRootPermission(handle)
  if (!ok) return null
  await saveRootHandle(handle)
  return handle
}

/** Przywraca dostęp do zapamiętanego folderu — wymaga kliknięcia użytkownika. */
export async function restoreStoredRootAccess(): Promise<FileSystemDirectoryHandle | null> {
  const stored = await readStoredRootHandle()
  if (!stored) return null
  const ok = await requestRootPermission(stored)
  if (!ok) return null
  saveRememberedFolderName(stored.name)
  return stored
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

export async function getLocalMusicStatusFromRoot(root: LocalMusicRoot): Promise<LocalMusicStatus> {
  const base = emptyStatus({
    permission: root.permission,
    rememberedFolderName: root.rememberedFolderName,
  })

  if (!root.handle || root.permission !== 'granted') {
    return base
  }

  const playlists = await scanLocalPlaylists(root.handle)
  return {
    ...base,
    connected: playlists.length > 0,
    folderName: root.handle.name,
    rememberedFolderName: root.handle.name,
    playlists,
    totalTracks: playlists.reduce((sum, p) => sum + p.trackCount, 0),
  }
}

/** @deprecated użyj resolveLocalMusicRoot + getLocalMusicStatusFromRoot */
export async function loadStoredRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const root = await resolveLocalMusicRoot({ requestIfNeeded: true })
  return root.handle
}

/** @deprecated użyj getLocalMusicStatusFromRoot */
export async function getLocalMusicStatus(root: FileSystemDirectoryHandle | null): Promise<LocalMusicStatus> {
  if (!root) return emptyStatus()
  return getLocalMusicStatusFromRoot({ handle: root, permission: 'granted', rememberedFolderName: root.name })
}

import type { CloudSyncPreferences } from './types'

const PREFS_KEY = 'magazyn_cloud_sync_prefs'

const DEFAULT_PREFS: CloudSyncPreferences = {
  syncKey: null,
  autoSync: true,
  lastSyncedAt: null,
  lastLocalModifiedAt: null,
}

export function loadSyncPreferences(): CloudSyncPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function saveSyncPreferences(prefs: CloudSyncPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export function touchLocalModified(): CloudSyncPreferences {
  const prefs = loadSyncPreferences()
  const next = { ...prefs, lastLocalModifiedAt: new Date().toISOString() }
  saveSyncPreferences(next)
  return next
}

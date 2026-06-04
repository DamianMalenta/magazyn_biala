import type { AppConfig } from '../../types/config'
import type { InventoryItem } from '../../types/inventory'
import { loadSyncPreferences, saveSyncPreferences } from './syncPreferences'
import { pullFromCloud, pushToCloud } from './supabaseClient'
import type { CloudSyncResult } from './types'

export function normalizeSyncKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '-')
}

export async function syncPush(
  syncKey: string,
  inventory: InventoryItem[],
  config: AppConfig,
): Promise<CloudSyncResult> {
  const key = normalizeSyncKey(syncKey)
  const updatedAt = new Date().toISOString()

  const result = await pushToCloud({
    syncKey: key,
    inventory,
    config,
    updatedAt,
  })

  if (result.ok) {
    const prefs = loadSyncPreferences()
    saveSyncPreferences({
      ...prefs,
      syncKey: key,
      lastSyncedAt: updatedAt,
      lastLocalModifiedAt: updatedAt,
    })
  }

  return result
}

export async function syncPull(syncKey: string): Promise<
  CloudSyncResult & {
    inventory?: InventoryItem[]
    config?: AppConfig
  }
> {
  const key = normalizeSyncKey(syncKey)
  const result = await pullFromCloud(key)

  if (result.ok && result.data) {
    const prefs = loadSyncPreferences()
    saveSyncPreferences({
      ...prefs,
      syncKey: key,
      lastSyncedAt: result.data.updatedAt,
    })

    return {
      ok: true,
      updatedAt: result.data.updatedAt,
      source: 'cloud',
      inventory: result.data.inventory,
      config: result.data.config,
    }
  }

  return result
}

export function shouldApplyCloudData(cloudUpdatedAt: string): boolean {
  const prefs = loadSyncPreferences()
  if (!prefs.lastLocalModifiedAt) return true
  return new Date(cloudUpdatedAt).getTime() >= new Date(prefs.lastLocalModifiedAt).getTime()
}

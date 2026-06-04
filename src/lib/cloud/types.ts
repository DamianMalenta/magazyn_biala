import type { AppConfig } from '../../types/config'
import type { InventoryItem } from '../../types/inventory'

export interface CloudPayload {
  syncKey: string
  inventory: InventoryItem[]
  config: AppConfig
  updatedAt: string
}

export interface CloudSyncPreferences {
  syncKey: string | null
  autoSync: boolean
  lastSyncedAt: string | null
  lastLocalModifiedAt: string | null
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'not_configured'

export interface CloudSyncResult {
  ok: boolean
  updatedAt?: string
  error?: string
  source?: 'cloud' | 'local'
}

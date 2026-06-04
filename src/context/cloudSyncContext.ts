import { createContext } from 'react'
import type { CloudSyncPreferences, CloudSyncStatus } from '../lib/cloud/types'

export interface CloudSyncContextValue {
  prefs: CloudSyncPreferences
  status: CloudSyncStatus
  statusMessage: string | null
  isConfigured: boolean
  setSyncKey: (key: string) => void
  setAutoSync: (enabled: boolean) => void
  pushNow: () => Promise<boolean>
  pullNow: () => Promise<boolean>
  notifyLocalChange: () => void
}

export const CloudSyncContext = createContext<CloudSyncContextValue | null>(null)

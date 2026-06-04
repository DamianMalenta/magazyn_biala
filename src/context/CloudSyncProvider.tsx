import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CloudSyncContext, type CloudSyncContextValue } from './cloudSyncContext'
import { useConfig } from '../hooks/useConfig'
import { useInventory } from '../hooks/useInventory'
import {
  isCloudConfigured,
  subscribeToCloudChanges,
} from '../lib/cloud/supabaseClient'
import {
  loadSyncPreferences,
  saveSyncPreferences,
  touchLocalModified,
} from '../lib/cloud/syncPreferences'
import { shouldApplyCloudData, syncPull, syncPush } from '../lib/cloud/syncService'
import type { CloudSyncStatus } from '../lib/cloud/types'
import { importConfigJson } from '../lib/storage/configStorage'

const AUTO_SYNC_DELAY_MS = 2000

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const { config, updateConfig } = useConfig()
  const { items, replaceAll } = useInventory()
  const [prefs, setPrefs] = useState(loadSyncPreferences)
  const [status, setStatus] = useState<CloudSyncStatus>(
    isCloudConfigured() ? 'idle' : 'not_configured',
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipAutoSync = useRef(true)
  const skipNextChange = useRef(false)
  const initialPullDone = useRef(false)

  const setPrefsState = useCallback((next: typeof prefs) => {
    setPrefs(next)
    saveSyncPreferences(next)
  }, [])

  const applyRemote = useCallback(
    (inventory: typeof items, remoteConfig: typeof config, updatedAt: string) => {
      skipNextChange.current = true
      replaceAll(inventory)
      updateConfig(() => importConfigJson(JSON.stringify(remoteConfig)))
      setPrefsState({
        ...loadSyncPreferences(),
        lastSyncedAt: updatedAt,
        lastLocalModifiedAt: updatedAt,
      })
    },
    [replaceAll, updateConfig, setPrefsState],
  )

  const pushNow = useCallback(async () => {
    if (!prefs.syncKey) {
      setStatus('error')
      setStatusMessage('Ustaw kod magazynu w zakładce Chmura')
      return false
    }
    if (!isCloudConfigured()) {
      setStatus('not_configured')
      setStatusMessage('Skonfiguruj Supabase w pliku .env.local')
      return false
    }

    setStatus('syncing')
    setStatusMessage('Wysyłanie do chmury…')

    const result = await syncPush(prefs.syncKey, items, config)
    if (result.ok) {
      setPrefsState(loadSyncPreferences())
      setStatus('synced')
      setStatusMessage(`Zsynchronizowano ${new Date().toLocaleTimeString('pl-PL')}`)
      return true
    }

    setStatus('error')
    setStatusMessage(result.error ?? 'Błąd wysyłania')
    return false
  }, [prefs.syncKey, items, config, setPrefsState])

  const pullNow = useCallback(async () => {
    if (!prefs.syncKey) {
      setStatus('error')
      setStatusMessage('Ustaw kod magazynu w zakładce Chmura')
      return false
    }
    if (!isCloudConfigured()) {
      setStatus('not_configured')
      setStatusMessage('Skonfiguruj Supabase w pliku .env.local')
      return false
    }

    setStatus('syncing')
    setStatusMessage('Pobieranie z chmury…')

    const result = await syncPull(prefs.syncKey)
    if (result.ok && result.inventory && result.config && result.updatedAt) {
      applyRemote(result.inventory, result.config, result.updatedAt)
      setStatus('synced')
      setStatusMessage(`Pobrano ${new Date().toLocaleTimeString('pl-PL')}`)
      return true
    }

    if (result.error?.includes('Brak danych')) {
      setStatus('idle')
      setStatusMessage('Chmura pusta — wyślij pierwszą kopię przyciskiem „Wyślij do chmury”')
      return false
    }

    setStatus('error')
    setStatusMessage(result.error ?? 'Błąd pobierania')
    return false
  }, [prefs.syncKey, applyRemote])

  const pushNowRef = useRef(pushNow)
  useEffect(() => {
    pushNowRef.current = pushNow
  }, [pushNow])

  const notifyLocalChange = useCallback(() => {
    if (skipNextChange.current) {
      skipNextChange.current = false
      return
    }
    touchLocalModified()
    setPrefs((p) => ({ ...p, lastLocalModifiedAt: new Date().toISOString() }))

    if (!prefs.autoSync || !prefs.syncKey || !isCloudConfigured()) return

    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      void pushNowRef.current()
    }, AUTO_SYNC_DELAY_MS)
  }, [prefs.autoSync, prefs.syncKey])

  const setSyncKey = useCallback(
    (key: string) => {
      const normalized = key.trim().toLowerCase().replace(/\s+/g, '-')
      setPrefsState({ ...prefs, syncKey: normalized || null })
    },
    [prefs, setPrefsState],
  )

  const setAutoSync = useCallback(
    (enabled: boolean) => {
      setPrefsState({ ...prefs, autoSync: enabled })
    },
    [prefs, setPrefsState],
  )

  useEffect(() => {
    if (!prefs.syncKey || !isCloudConfigured()) return

    const unsubscribe = subscribeToCloudChanges(prefs.syncKey, (payload) => {
      if (!shouldApplyCloudData(payload.updatedAt)) return
      applyRemote(payload.inventory, payload.config, payload.updatedAt)
      setStatus('synced')
      setStatusMessage(`Odebrano zmiany ${new Date().toLocaleTimeString('pl-PL')}`)
    })

    return () => unsubscribe?.()
  }, [prefs.syncKey, applyRemote])

  useEffect(() => {
    if (initialPullDone.current || !prefs.syncKey || !isCloudConfigured()) return
    initialPullDone.current = true
    void pullNow()
  }, [prefs.syncKey, pullNow])

  useEffect(() => {
    if (skipAutoSync.current) {
      skipAutoSync.current = false
      return
    }
    notifyLocalChange()
  }, [config, items, notifyLocalChange])

  const value = useMemo<CloudSyncContextValue>(
    () => ({
      prefs,
      status,
      statusMessage,
      isConfigured: isCloudConfigured(),
      setSyncKey,
      setAutoSync,
      pushNow,
      pullNow,
      notifyLocalChange,
    }),
    [prefs, status, statusMessage, setSyncKey, setAutoSync, pushNow, pullNow, notifyLocalChange],
  )

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>
}

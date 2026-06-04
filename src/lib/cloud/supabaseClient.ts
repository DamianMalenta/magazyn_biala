import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AppConfig } from '../../types/config'
import type { InventoryItem } from '../../types/inventory'
import type { CloudPayload, CloudSyncResult } from './types'

let client: SupabaseClient | null = null

export function isCloudConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export function getSupabase(): SupabaseClient | null {
  if (!isCloudConfigured()) return null

  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
    )
  }

  return client
}

interface WarehouseRow {
  sync_key: string
  inventory: InventoryItem[]
  config: AppConfig
  updated_at: string
}

export async function pushToCloud(payload: CloudPayload): Promise<CloudSyncResult> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Brak konfiguracji Supabase (VITE_SUPABASE_URL / ANON_KEY)' }
  }

  const { error } = await supabase.from('warehouse_sync').upsert({
    sync_key: payload.syncKey,
    inventory: payload.inventory,
    config: payload.config,
    updated_at: payload.updatedAt,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, updatedAt: payload.updatedAt, source: 'local' }
}

export async function pullFromCloud(syncKey: string): Promise<CloudSyncResult & { data?: CloudPayload }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Brak konfiguracji Supabase (VITE_SUPABASE_URL / ANON_KEY)' }
  }

  const { data, error } = await supabase
    .from('warehouse_sync')
    .select('sync_key, inventory, config, updated_at')
    .eq('sync_key', syncKey)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data) {
    return { ok: false, error: 'Brak danych w chmurze dla tego kodu magazynu' }
  }

  const row = data as WarehouseRow

  return {
    ok: true,
    updatedAt: row.updated_at,
    source: 'cloud',
    data: {
      syncKey: row.sync_key,
      inventory: row.inventory,
      config: row.config,
      updatedAt: row.updated_at,
    },
  }
}

export function subscribeToCloudChanges(
  syncKey: string,
  onChange: (payload: CloudPayload) => void,
): (() => void) | null {
  const supabase = getSupabase()
  if (!supabase) return null

  const channel = supabase
    .channel(`warehouse_sync:${syncKey}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'warehouse_sync',
        filter: `sync_key=eq.${syncKey}`,
      },
      (payload) => {
        const row = payload.new as WarehouseRow | undefined
        if (!row?.sync_key) return
        onChange({
          syncKey: row.sync_key,
          inventory: row.inventory,
          config: row.config,
          updatedAt: row.updated_at,
        })
      },
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

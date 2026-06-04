import type { InventoryItem, StandardUOM, Category } from '../../types/inventory'
import { DEFAULT_INVENTORY, STORAGE_KEY } from '../data/defaultInventory'

export interface PersistedState {
  inventory: InventoryItem[]
  customAliases: Record<string, string[]>
}

function migrateUnit(unit: unknown): StandardUOM {
  const map: Record<string, StandardUOM> = {
    szt: 'szt.',
    kg: 'kg.',
    op: 'opak.',
    worek: 'opak.',
    'szt.': 'szt.',
    'kg.': 'kg.',
    'opak.': 'opak.',
  }
  if (typeof unit === 'string' && unit in map) return map[unit]
  return 'szt.'
}

function migrateItem(raw: Record<string, unknown>): InventoryItem | null {
  if (!raw.name || !raw.category) return null

  return {
    id: String(raw.id ?? crypto.randomUUID()),
    name: String(raw.name),
    category: raw.category as Category,
    unit: migrateUnit(raw.unit),
    qty: typeof raw.qty === 'number' ? raw.qty : 0,
  }
}

function migrateInventory(raw: unknown): InventoryItem[] {
  if (!Array.isArray(raw)) return [...DEFAULT_INVENTORY]

  const migrated = raw
    .map((item) => migrateItem(item as Record<string, unknown>))
    .filter((item): item is InventoryItem => item !== null)

  return migrated.length > 0 ? migrated : [...DEFAULT_INVENTORY]
}

function migrateAliases(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}

  const result: Record<string, string[]> = {}
  for (const [skuId, aliases] of Object.entries(raw)) {
    if (Array.isArray(aliases)) {
      result[skuId] = aliases.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
    }
  }
  return result
}

export function loadState(): PersistedState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { inventory: [...DEFAULT_INVENTORY], customAliases: {} }
    }

    const parsed: unknown = JSON.parse(stored)

    if (Array.isArray(parsed)) {
      return { inventory: migrateInventory(parsed), customAliases: {} }
    }

    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      return {
        inventory: migrateInventory(obj.inventory ?? obj.items),
        customAliases: migrateAliases(obj.customAliases),
      }
    }

    return { inventory: [...DEFAULT_INVENTORY], customAliases: {} }
  } catch {
    return { inventory: [...DEFAULT_INVENTORY], customAliases: {} }
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadInventory(): InventoryItem[] {
  return loadState().inventory
}

export function saveInventory(items: InventoryItem[]): void {
  const state = loadState()
  saveState({ ...state, inventory: items })
}

export function resetState(): PersistedState {
  localStorage.removeItem(STORAGE_KEY)
  return { inventory: [...DEFAULT_INVENTORY], customAliases: {} }
}

export function resetInventory(): InventoryItem[] {
  return resetState().inventory
}

export function exportStateBlob(): string {
  const state = loadState()
  return JSON.stringify(
    {
      version: 4,
      exportedAt: new Date().toISOString(),
      ...state,
    },
    null,
    2,
  )
}

export function importStateFromJson(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>
    const inventory = migrateInventory(parsed.inventory ?? parsed.items)
    const customAliases = migrateAliases(parsed.customAliases)

    saveState({ inventory, customAliases })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Nieprawidłowy format pliku JSON.' }
  }
}

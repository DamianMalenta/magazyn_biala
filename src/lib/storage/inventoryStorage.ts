import type { InventoryItem, StandardUOM, Category } from '../../types/inventory'
import { DEFAULT_INVENTORY, STORAGE_KEY } from '../data/defaultInventory'

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

export function loadInventory(): InventoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return [...DEFAULT_INVENTORY]

    const parsed = JSON.parse(stored) as Record<string, unknown>[]
    if (!Array.isArray(parsed)) return [...DEFAULT_INVENTORY]

    const migrated = parsed
      .map((item) => migrateItem(item))
      .filter((item): item is InventoryItem => item !== null)

    return migrated.length > 0 ? migrated : [...DEFAULT_INVENTORY]
  } catch {
    return [...DEFAULT_INVENTORY]
  }
}

export function saveInventory(items: InventoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function resetInventory(): InventoryItem[] {
  localStorage.removeItem(STORAGE_KEY)
  return [...DEFAULT_INVENTORY]
}

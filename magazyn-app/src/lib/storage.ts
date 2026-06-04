import { DEFAULT_INVENTORY } from './defaultInventory'
import { STORAGE_KEY } from './dictionary'
import type { InventoryItem, StandardUnit } from './types'
import { STANDARD_UNITS } from './types'

function migrateUnit(raw: string): StandardUnit {
  const map: Record<string, StandardUnit> = {
    kg: 'kg.',
    'kg.': 'kg.',
    szt: 'szt.',
    'szt.': 'szt.',
    op: 'opak.',
    opak: 'opak.',
    'opak.': 'opak.',
    worek: 'opak.',
  }
  return map[raw] ?? 'szt.'
}

function migrateItem(item: InventoryItem & { unit?: string }): InventoryItem {
  return {
    ...item,
    id: String(item.id),
    unit: migrateUnit(item.unit as string),
  }
}

export function loadInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_INVENTORY)
    const parsed = JSON.parse(raw) as InventoryItem[]
    return parsed.map(migrateItem)
  } catch {
    return structuredClone(DEFAULT_INVENTORY)
  }
}

export function saveInventory(items: InventoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function isValidUnit(u: string): u is StandardUnit {
  return (STANDARD_UNITS as readonly string[]).includes(u)
}

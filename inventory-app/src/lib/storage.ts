import { DEFAULT_ALIASES, DEFAULT_INVENTORY, STORAGE_KEY } from '@/lib/dictionary/defaultInventory'
import type { InventoryItem } from '@/types/inventory'

export interface PersistedState {
  inventory: InventoryItem[]
  customAliases: Record<string, string[]>
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        inventory: structuredClone(DEFAULT_INVENTORY),
        customAliases: structuredClone(DEFAULT_ALIASES),
      }
    }
    const parsed = JSON.parse(raw) as PersistedState
    return {
      inventory: parsed.inventory?.length ? parsed.inventory : structuredClone(DEFAULT_INVENTORY),
      customAliases: { ...DEFAULT_ALIASES, ...parsed.customAliases },
    }
  } catch {
    return {
      inventory: structuredClone(DEFAULT_INVENTORY),
      customAliases: structuredClone(DEFAULT_ALIASES),
    }
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

import { createContext } from 'react'
import type { Category, InventoryItem, StandardUOM } from '../types/inventory'

export type AddItemResult =
  | { status: 'created'; id: string; name: string }
  | { status: 'exists'; id: string; name: string }
  | { status: 'updated'; id: string; name: string; addedQty: number }

export interface InventoryContextValue {
  items: InventoryItem[]
  customAliases: Record<string, string[]>
  highlightItemId: string | null
  addItem: (payload: {
    name: string
    category: Category
    unit: StandardUOM
    qty?: number
  }) => AddItemResult
  updateQty: (id: string, delta: number) => void
  setQty: (id: string, qty: number) => void
  setUnit: (id: string, unit: StandardUOM) => void
  applyBulkUpdates: (updates: Map<string, number>) => void
  deleteItem: (id: string) => void
  resetToDefaults: () => void
  getItemById: (id: string) => InventoryItem | undefined
  addCustomAlias: (skuId: string, alias: string) => void
  exportBackup: () => void
  importBackup: (file: File) => Promise<{ ok: true } | { ok: false; error: string }>
}

export const InventoryContext = createContext<InventoryContextValue | null>(null)

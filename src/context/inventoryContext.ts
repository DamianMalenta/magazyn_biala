import { createContext } from 'react'
import type { Category, InventoryItem, StandardUOM } from '../types/inventory'

export interface InventoryContextValue {
  items: InventoryItem[]
  addItem: (payload: { name: string; category: Category; unit: StandardUOM; qty?: number }) => void
  updateQty: (id: string, delta: number) => void
  setQty: (id: string, qty: number) => void
  applyBulkUpdates: (updates: Map<string, number>) => void
  deleteItem: (id: string) => void
  resetToDefaults: () => void
  getItemById: (id: string) => InventoryItem | undefined
}

export const InventoryContext = createContext<InventoryContextValue | null>(null)

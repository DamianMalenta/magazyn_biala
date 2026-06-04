import { createContext } from 'react'
import type { InventoryItem, StandardUOM, Category } from '../types/inventory'

export interface InventoryContextValue {
  items: InventoryItem[]
  addItem: (payload: { name: string; category: Category; unit: StandardUOM; qty?: number }) => void
  updateItem: (id: string, patch: Partial<Pick<InventoryItem, 'name' | 'category' | 'unit' | 'qty'>>) => void
  updateQty: (id: string, delta: number) => void
  setQty: (id: string, qty: number) => void
  applyBulkUpdates: (updates: Map<string, number>) => void
  deleteItem: (id: string) => void
  resetToDefaults: () => void
  replaceAll: (items: InventoryItem[]) => void
  getItemById: (id: string) => InventoryItem | undefined
  countByCategory: (category: string) => number
}

export const InventoryContext = createContext<InventoryContextValue | null>(null)

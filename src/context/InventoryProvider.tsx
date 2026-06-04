import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { InventoryContext } from './inventoryContext'
import type { Category, InventoryItem, StandardUOM } from '../types/inventory'
import { loadInventory, saveInventory, resetInventory } from '../lib/storage/inventoryStorage'
import { createId } from '../lib/utils/text'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(() => loadInventory())

  const persist = useCallback((next: InventoryItem[]) => {
    setItems(next)
    saveInventory(next)
  }, [])

  const addItem = useCallback(
    (payload: { name: string; category: Category; unit: StandardUOM; qty?: number }) => {
      persist([
        ...items,
        {
          id: createId('sku'),
          name: payload.name.trim(),
          category: payload.category,
          unit: payload.unit,
          qty: payload.qty ?? 0,
        },
      ])
    },
    [items, persist],
  )

  const updateQty = useCallback(
    (id: string, delta: number) => {
      persist(
        items.map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item,
        ),
      )
    },
    [items, persist],
  )

  const setQty = useCallback(
    (id: string, qty: number) => {
      persist(
        items.map((item) => (item.id === id ? { ...item, qty: Math.max(0, qty) } : item)),
      )
    },
    [items, persist],
  )

  const applyBulkUpdates = useCallback(
    (updates: Map<string, number>) => {
      persist(
        items.map((item) =>
          updates.has(item.id) ? { ...item, qty: Math.max(0, updates.get(item.id)!) } : item,
        ),
      )
    },
    [items, persist],
  )

  const deleteItem = useCallback(
    (id: string) => {
      persist(items.filter((item) => item.id !== id))
    },
    [items, persist],
  )

  const resetToDefaults = useCallback(() => {
    persist(resetInventory())
  }, [persist])

  const getItemById = useCallback((id: string) => items.find((item) => item.id === id), [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      setQty,
      applyBulkUpdates,
      deleteItem,
      resetToDefaults,
      getItemById,
    }),
    [items, addItem, updateQty, setQty, applyBulkUpdates, deleteItem, resetToDefaults, getItemById],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

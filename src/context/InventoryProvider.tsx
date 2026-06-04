import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { InventoryContext } from './inventoryContext'
import type { Category, InventoryItem, StandardUOM } from '../types/inventory'
import { loadInventory, saveInventory, resetInventory } from '../lib/storage/inventoryStorage'
import { createId } from '../lib/utils/text'

interface InventoryProviderProps {
  children: ReactNode
  onSkuRenamed?: (oldName: string, newName: string) => void
}

export function InventoryProvider({ children, onSkuRenamed }: InventoryProviderProps) {
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

  const updateItem = useCallback(
    (id: string, patch: Partial<Pick<InventoryItem, 'name' | 'category' | 'unit' | 'qty'>>) => {
      const current = items.find((i) => i.id === id)
      if (!current) return

      if (patch.name && patch.name !== current.name) {
        onSkuRenamed?.(current.name, patch.name)
      }

      persist(
        items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      )
    },
    [items, persist, onSkuRenamed],
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

  const replaceAll = useCallback(
    (next: InventoryItem[]) => {
      persist(next)
    },
    [persist],
  )

  const getItemById = useCallback((id: string) => items.find((item) => item.id === id), [items])

  const countByCategory = useCallback(
    (category: string) => items.filter((i) => i.category === category).length,
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateItem,
      updateQty,
      setQty,
      applyBulkUpdates,
      deleteItem,
      resetToDefaults,
      replaceAll,
      getItemById,
      countByCategory,
    }),
    [
      items,
      addItem,
      updateItem,
      updateQty,
      setQty,
      applyBulkUpdates,
      deleteItem,
      resetToDefaults,
      replaceAll,
      getItemById,
      countByCategory,
    ],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

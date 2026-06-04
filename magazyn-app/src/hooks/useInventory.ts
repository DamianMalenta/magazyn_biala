import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_INVENTORY } from '../lib/defaultInventory'
import { loadInventory, saveInventory } from '../lib/storage'
import type { Category, InventoryItem, StandardUnit } from '../lib/types'

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(() => loadInventory())

  useEffect(() => {
    saveInventory(items)
  }, [items])

  const changeQty = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(0, item.qty + delta) }
          : item
      )
    )
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, qty) } : item
      )
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addItem = useCallback(
    (name: string, category: Category, unit: StandardUnit, qty = 0) => {
      setItems((prev) => [
        ...prev,
        {
          id: `sku-${Date.now()}`,
          name: name.trim(),
          category,
          unit,
          qty,
        },
      ])
    },
    []
  )

  const resetToDefault = useCallback(() => {
    if (
      confirm(
        'Przywrócić domyślny katalog SKU? Spowoduje to utratę własnych pozycji.'
      )
    ) {
      setItems(structuredClone(DEFAULT_INVENTORY))
    }
  }, [])

  const applyParsedUpdates = useCallback(
    (mutated: InventoryItem[]) => {
      setItems(structuredClone(mutated))
    },
    []
  )

  return {
    items,
    changeQty,
    setQty,
    removeItem,
    addItem,
    resetToDefault,
    applyParsedUpdates,
  }
}

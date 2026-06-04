import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { InventoryContext } from './inventoryContext'
import type { Category, InventoryItem, StandardUOM } from '../types/inventory'
import {
  exportStateBlob,
  importStateFromJson,
  loadState,
  resetState,
  saveState,
} from '../lib/storage/inventoryStorage'
import { createId, normalizeText } from '../lib/utils/text'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(() => loadState().inventory)
  const [customAliases, setCustomAliases] = useState<Record<string, string[]>>(
    () => loadState().customAliases,
  )

  const persist = useCallback(
    (nextItems: InventoryItem[], nextAliases: Record<string, string[]> = customAliases) => {
      setItems(nextItems)
      setCustomAliases(nextAliases)
      saveState({ inventory: nextItems, customAliases: nextAliases })
    },
    [customAliases],
  )

  const addItem = useCallback(
    (payload: { name: string; category: Category; unit: StandardUOM; qty?: number }) => {
      const next = [
        ...items,
        {
          id: createId('sku'),
          name: payload.name.trim(),
          category: payload.category,
          unit: payload.unit,
          qty: payload.qty ?? 0,
        },
      ]
      persist(next)
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
      persist(items.map((item) => (item.id === id ? { ...item, qty: Math.max(0, qty) } : item)))
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
      const nextAliases = { ...customAliases }
      delete nextAliases[id]
      persist(
        items.filter((item) => item.id !== id),
        nextAliases,
      )
    },
    [customAliases, items, persist],
  )

  const resetToDefaults = useCallback(() => {
    const fresh = resetState()
    setItems(fresh.inventory)
    setCustomAliases(fresh.customAliases)
  }, [])

  const getItemById = useCallback((id: string) => items.find((item) => item.id === id), [items])

  const addCustomAlias = useCallback(
    (skuId: string, alias: string) => {
      const trimmed = alias.trim()
      if (!trimmed) return

      const normalized = normalizeText(trimmed)
      const existing = customAliases[skuId] ?? []
      if (existing.some((a) => normalizeText(a) === normalized)) return

      const nextAliases = {
        ...customAliases,
        [skuId]: [...existing, trimmed],
      }
      saveState({ inventory: items, customAliases: nextAliases })
      setCustomAliases(nextAliases)
    },
    [customAliases, items],
  )

  const exportBackup = useCallback(() => {
    const blob = new Blob([exportStateBlob()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `magazyn-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  const importBackup = useCallback(async (file: File) => {
    const text = await file.text()
    const result = importStateFromJson(text)
    if (!result.ok) return result

    const state = loadState()
    setItems(state.inventory)
    setCustomAliases(state.customAliases)
    return { ok: true as const }
  }, [])

  const value = useMemo(
    () => ({
      items,
      customAliases,
      addItem,
      updateQty,
      setQty,
      applyBulkUpdates,
      deleteItem,
      resetToDefaults,
      getItemById,
      addCustomAlias,
      exportBackup,
      importBackup,
    }),
    [
      items,
      customAliases,
      addItem,
      updateQty,
      setQty,
      applyBulkUpdates,
      deleteItem,
      resetToDefaults,
      getItemById,
      addCustomAlias,
      exportBackup,
      importBackup,
    ],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

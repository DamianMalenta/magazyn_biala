import { useCallback, useEffect, useState } from 'react'
import type { Category, InventoryItem, ParseResult, StandardUom } from '@/types/inventory'
import { parseMessengerText } from '@/lib/parser'
import { loadState, saveState } from '@/lib/storage'

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customAliases, setCustomAliases] = useState<Record<string, string[]>>({})
  const [lastParse, setLastParse] = useState<ParseResult | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const state = loadState()
    setInventory(state.inventory)
    setCustomAliases(state.customAliases)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveState({ inventory, customAliases })
  }, [inventory, customAliases, hydrated])

  const updateQty = useCallback((id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(0, Math.round((item.qty + delta) * 100) / 100) }
          : item,
      ),
    )
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, qty) } : item,
      ),
    )
  }, [])

  const addItem = useCallback(
    (name: string, category: Category, uom: StandardUom) => {
      const trimmed = name.trim()
      if (!trimmed) return null
      const id = `sku-${Date.now()}`
      const item: InventoryItem = {
        id,
        name: trimmed,
        category,
        uom,
        qty: 0,
      }
      setInventory((prev) => [...prev, item])
      return item
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id))
    setCustomAliases((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const applyParse = useCallback(
    (rawText: string): ParseResult => {
      const result = parseMessengerText(rawText, inventory, customAliases)
      setLastParse(result)

      if (result.updates.length > 0) {
        const qtyBySku = new Map(result.updates.map((u) => [u.skuId, u.qty]))
        setInventory((prev) =>
          prev.map((item) =>
            qtyBySku.has(item.id) ? { ...item, qty: qtyBySku.get(item.id)! } : item,
          ),
        )
      }

      return result
    },
    [inventory, customAliases],
  )

  const resolveQuarantine = useCallback(
    (skuId: string, rawName: string, qty: number, rememberAlias: boolean) => {
      setQty(skuId, qty)
      if (rememberAlias && rawName.trim()) {
        setCustomAliases((prev) => {
          const existing = prev[skuId] ?? []
          const normalized = rawName.trim().toLowerCase()
          if (existing.some((a) => a.toLowerCase() === normalized)) return prev
          return { ...prev, [skuId]: [...existing, rawName.trim()] }
        })
      }
    },
    [setQty],
  )

  const resetInventory = useCallback(() => {
    const state = loadState()
    setInventory(state.inventory)
    setCustomAliases(state.customAliases)
    setLastParse(null)
  }, [])

  return {
    inventory,
    customAliases,
    lastParse,
    hydrated,
    updateQty,
    setQty,
    addItem,
    removeItem,
    applyParse,
    resolveQuarantine,
    resetInventory,
    setLastParse,
  }
}

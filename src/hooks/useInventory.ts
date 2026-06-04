import { useContext } from 'react'
import { InventoryContext } from '../context/inventoryContext'

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}

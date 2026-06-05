import type { InventoryItem } from '../../types/inventory'
import { normalizeText } from '../utils/text'

/** Szuka SKU po nazwie (bez rozróżniania wielkości liter i polskich znaków). */
export function findItemByName(items: InventoryItem[], name: string): InventoryItem | undefined {
  const norm = normalizeText(name)
  if (!norm) return undefined
  return items.find((item) => normalizeText(item.name) === norm)
}

import type { Category, InventoryItem, ParseResult } from '@/types/inventory'
import { detectCategoryHeader } from '@/lib/dictionary/categories'
import { buildAliasIndex, matchProductToSku } from './aliasMatcher'
import { extractLineData, isMetaLine, looksLikeInventoryItem } from './lineParser'

export function parseMessengerText(
  rawText: string,
  inventory: InventoryItem[],
  customAliases: Record<string, string[]>,
): ParseResult {
  const aliasIndex = buildAliasIndex(inventory, customAliases)
  const itemById = new Map(inventory.map((i) => [i.id, i]))

  const updates: ParseResult['updates'] = []
  const quarantine: ParseResult['quarantine'] = []
  const logs: ParseResult['logs'] = []

  let currentCategory: Category | null = null
  const lines = rawText.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (isMetaLine(line)) {
      logs.push({ type: 'meta', message: `Pominięto meta: ${line}` })
      continue
    }

    const headerCategory = detectCategoryHeader(line)
    if (headerCategory && !looksLikeInventoryItem(line) && !/^\d/.test(line)) {
      currentCategory = headerCategory
      logs.push({
        type: 'category',
        message: `Strefa: ${headerCategory}`,
      })
      continue
    }

    const extracted = extractLineData(line)
    if (!extracted.productName) continue

    const match = matchProductToSku(extracted.productName, aliasIndex)
    const sku = match ? itemById.get(match.skuId) : undefined

    if (sku) {
      if (currentCategory && sku.category !== currentCategory) {
        logs.push({
          type: 'warning',
          message: `${sku.name}: przypisano do ${sku.category} (strefa w tekście: ${currentCategory})`,
        })
      } else {
        logs.push({
          type: 'success',
          message: `✓ ${sku.name}: ${extracted.qty} ${sku.uom}`,
        })
      }

      updates.push({
        kind: 'matched',
        skuId: sku.id,
        skuName: sku.name,
        qty: extracted.qty,
        uom: sku.uom,
        category: sku.category,
        zoneCategory: currentCategory,
        rawLine: line,
      })
    } else {
      quarantine.push({
        kind: 'quarantine',
        rawName: extracted.productName,
        qty: extracted.qty,
        uom: extracted.uom,
        suggestedCategory: currentCategory ?? 'OPAKOWANIA',
        rawLine: line,
      })
      logs.push({
        type: 'warning',
        message: `Kwarantanna: ${extracted.productName}`,
      })
    }
  }

  return { updates, quarantine, logs }
}

export { extractLineData, isMetaLine } from './lineParser'
export { normalizeUom } from './uomNormalizer'
export { detectCategoryHeader } from '@/lib/dictionary/categories'

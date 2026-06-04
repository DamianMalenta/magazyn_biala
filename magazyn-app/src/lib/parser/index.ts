import { IGNORE_LINE_PATTERNS } from '../dictionary'
import type { Category, InventoryItem, ParseResult, QuarantineItem } from '../types'
import { detectCategoryHeader } from './categoryDetector'
import { parseLineQuantity } from './lineParser'
import { findInventoryMatch, resolveCanonicalName } from './aliasMatcher'

function shouldIgnoreLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return true
  return IGNORE_LINE_PATTERNS.some((re) => re.test(trimmed))
}

export function parseMessengerText(
  rawText: string,
  inventory: InventoryItem[]
): ParseResult {
  const logs: ParseResult['logs'] = []
  const quarantine: QuarantineItem[] = []
  const updatedIds: string[] = []

  let currentCategory: Category | null = null
  const inventoryIndex = inventory.map((i) => ({ id: i.id, name: i.name }))

  const lines = rawText.split(/\r?\n/)

  for (const line of lines) {
    const cleanLine = line.trim()
    if (!cleanLine) continue

    if (shouldIgnoreLine(cleanLine)) {
      logs.push({ type: 'skip', message: `Pominięto meta: ${cleanLine}` })
      continue
    }

    const parsed = parseLineQuantity(cleanLine)
    const categoryHeader = detectCategoryHeader(cleanLine, parsed)

    if (categoryHeader) {
      currentCategory = categoryHeader
      logs.push({
        type: 'category',
        message: `Strefa: ${currentCategory}`,
      })
      continue
    }

    if (!parsed.rawName) continue

    const canonical = resolveCanonicalName(parsed.rawName)
    const match = findInventoryMatch(inventoryIndex, canonical, parsed.rawName)

    if (match) {
      const item = inventory.find((i) => i.id === match.id)!
      if (currentCategory && item.category !== currentCategory) {
        logs.push({
          type: 'warning',
          message: `${item.name}: przypisano do ${item.category} (nie ${currentCategory})`,
        })
      }
      item.qty = parsed.qty
      updatedIds.push(item.id)
      logs.push({
        type: 'success',
        message: `${item.name}: ${parsed.qty} ${item.unit}`,
      })
    } else {
      const q: QuarantineItem = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        rawLine: cleanLine,
        rawName: parsed.rawName,
        qty: parsed.qty,
        unit: parsed.unit,
        suggestedCategory: currentCategory ?? 'OPAKOWANIA',
        suggestedName: canonical !== parsed.rawName ? canonical : undefined,
      }
      quarantine.push(q)
      logs.push({
        type: 'warning',
        message: `Kwarantanna: ${parsed.rawName} (${parsed.qty} ${parsed.unit})`,
      })
    }
  }

  return { logs, quarantine, updatedIds }
}

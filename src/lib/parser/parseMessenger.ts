import type { InventoryItem, ParseLogEntry, ParseResult, QuarantineItem } from '../../types/inventory'
import type { ParserConfig } from '../../types/config'
import { matchSkuName } from './aliasMatcher'
import { CategoryStateMachine, classifyLine } from './categoryStateMachine'
import { extractQuantityAndName } from './quantityExtractor'
import { createId } from '../utils/text'

function resolveSkuMatch(
  rawLine: string,
  extracted: ReturnType<typeof extractQuantityAndName>,
  inventoryNames: string[],
  config: ParserConfig,
) {
  const fallbackName = rawLine.replace(/^\d+(?:[.,]\d+)?\s*(?:x|kg\.?|g\b)?\s*/i, '').trim()

  return (
    matchSkuName(extracted.cleanName, inventoryNames, config) ??
    matchSkuName(extracted.rawName, inventoryNames, config) ??
    matchSkuName(fallbackName, inventoryNames, config)
  )
}

export function parseMessengerText(
  rawText: string,
  inventory: InventoryItem[],
  config: ParserConfig,
): ParseResult {
  const updates = new Map<string, number>()
  const quarantine: QuarantineItem[] = []
  const logs: ParseLogEntry[] = []
  const stateMachine = new CategoryStateMachine(config)
  const inventoryNames = inventory.map((item) => item.name)

  const lines = rawText.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const classification = classifyLine(trimmed, config)

    if (classification.kind === 'ignore') {
      logs.push({
        id: createId('log'),
        type: 'meta',
        message: `Pominięto: „${trimmed}"`,
      })
      continue
    }

    const newZone = stateMachine.processClassification(classification)
    if (newZone) {
      logs.push({
        id: createId('log'),
        type: 'category',
        message: `Strefa → ${newZone}`,
      })
      continue
    }

    const extracted = extractQuantityAndName(trimmed, config)
    const match = resolveSkuMatch(trimmed, extracted, inventoryNames, config)

    const targetItem = match
      ? inventory.find((item) => item.name === match.canonical)
      : inventory.find(
          (item) =>
            item.name.toLowerCase() === extracted.cleanName.toLowerCase() ||
            item.name.toLowerCase() === extracted.rawName.toLowerCase(),
        )

    if (targetItem) {
      updates.set(targetItem.id, extracted.qty)

      const zoneMismatch = stateMachine.zone !== null && targetItem.category !== stateMachine.zone

      const confidenceNote = match?.confidence === 'fuzzy' ? ' (dopasowanie rozmyte)' : ''

      logs.push({
        id: createId('log'),
        type: zoneMismatch ? 'warning' : 'success',
        message: zoneMismatch
          ? `✓ ${targetItem.name}: ${extracted.qty} ${targetItem.unit} — SKU w ${targetItem.category}, w tekście: ${stateMachine.zone}${confidenceNote}`
          : `✓ ${targetItem.name}: ${extracted.qty} ${targetItem.unit}${confidenceNote}`,
      })
      continue
    }

    quarantine.push({
      id: createId('q'),
      rawLine: trimmed,
      rawName: extracted.cleanName,
      qty: extracted.qty,
      unit: extracted.unit,
      suggestedCategory: stateMachine.suggestCategory(),
      suggestedSkuId: match
        ? inventory.find((i) => i.name === match.canonical)?.id
        : undefined,
    })

    logs.push({
      id: createId('log'),
      type: 'error',
      message: `✗ Nierozpoznane: „${extracted.cleanName}" (${extracted.qty} ${extracted.unit})`,
    })
  }

  return { updates, quarantine, logs }
}

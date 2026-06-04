import type { InventoryItem, ParseLogEntry, ParseResult, QuarantineItem } from '../../types/inventory'
import { buildAliasEntries, matchSkuName } from './aliasMatcher'
import { CategoryStateMachine, classifyLine } from './categoryStateMachine'
import { extractQuantityAndName } from './quantityExtractor'
import { createId } from '../utils/text'

function resolveSkuMatch(
  rawLine: string,
  extracted: ReturnType<typeof extractQuantityAndName>,
  inventoryNames: string[],
  aliasEntries: ReturnType<typeof buildAliasEntries>,
) {
  const fallbackName = rawLine.replace(/^\d+(?:[.,]\d+)?\s*(?:x|kg\.?|g\b)?\s*/i, '').trim()

  return (
    matchSkuName(extracted.cleanName, inventoryNames, aliasEntries) ??
    matchSkuName(extracted.rawName, inventoryNames, aliasEntries) ??
    matchSkuName(fallbackName, inventoryNames, aliasEntries)
  )
}

const CONFIDENCE_LABEL: Record<string, string> = {
  fuzzy: ' (dopasowanie rozmyte)',
  learned: ' (alias użytkownika)',
}

export function parseMessengerText(
  rawText: string,
  inventory: InventoryItem[],
  customAliases: Record<string, string[]> = {},
): ParseResult {
  const updates = new Map<string, number>()
  const quarantine: QuarantineItem[] = []
  const logs: ParseLogEntry[] = []
  const stateMachine = new CategoryStateMachine()
  const inventoryNames = inventory.map((item) => item.name)
  const aliasEntries = buildAliasEntries(inventory, customAliases)

  const lines = rawText.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const classification = classifyLine(trimmed)

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

    const extracted = extractQuantityAndName(trimmed)
    const match = resolveSkuMatch(trimmed, extracted, inventoryNames, aliasEntries)

    const targetItem = match
      ? inventory.find((item) => item.name === match.canonical)
      : inventory.find(
          (item) =>
            item.name.toLowerCase() === extracted.cleanName.toLowerCase() ||
            item.name.toLowerCase() === extracted.rawName.toLowerCase(),
        )

    if (targetItem) {
      updates.set(targetItem.id, extracted.qty)

      const zoneMismatch =
        stateMachine.zone !== null && targetItem.category !== stateMachine.zone

      const confidenceNote = match ? (CONFIDENCE_LABEL[match.confidence] ?? '') : ''

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

  const touchedCategories = [...stateMachine.getTouchedCategories()]

  for (const item of inventory) {
    if (touchedCategories.includes(item.category) && !updates.has(item.id)) {
      updates.set(item.id, 0)
    }
  }

  for (const category of touchedCategories) {
    const zeroed = inventory.filter(
      (item) => item.category === category && updates.get(item.id) === 0,
    ).length
    if (zeroed > 0) {
      logs.push({
        id: createId('log'),
        type: 'meta',
        message: `Strefa ${category}: ${zeroed} SKU bez wpisu w wiadomości → stan 0 (ukryte)`,
      })
    }
  }

  return { updates, quarantine, logs, touchedCategories }
}

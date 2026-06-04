import {
  detectCategory,
  findInventoryItem,
  isIgnoredLine,
  resolveCanonicalName,
} from './dictionary';
import { extractQuantityAndName } from './units';
import type {
  Category,
  InventoryItem,
  ParseLog,
  ParseResult,
  QuarantineItem,
} from '@/types/inventory';

let logCounter = 0;

function createLog(type: ParseLog['type'], message: string): ParseLog {
  logCounter += 1;
  return { id: `log-${logCounter}`, type, message };
}

export function parseMessengerText(
  rawText: string,
  inventory: InventoryItem[],
): ParseResult {
  logCounter = 0;
  const logs: ParseLog[] = [];
  const updatedItemIds: string[] = [];
  const quarantine: QuarantineItem[] = [];

  let currentCategory: Category | null = null;
  let quarantineCounter = 0;

  for (const line of rawText.split('\n')) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    if (isIgnoredLine(cleanLine)) {
      logs.push(createLog('skip', `Pominięto meta-dane: ${cleanLine}`));
      continue;
    }

    // Category headers never start with a quantity
    const foundCategory =
      !/^\d/.test(cleanLine) ? detectCategory(cleanLine) : null;
    if (foundCategory) {
      currentCategory = foundCategory;
      logs.push(createLog('category', `Strefa: ${foundCategory}`));
      continue;
    }

    const { qty, unit, itemName } = extractQuantityAndName(cleanLine);
    const canonicalName = resolveCanonicalName(itemName);
    const targetItem = findInventoryItem(inventory, itemName, canonicalName);

    if (targetItem) {
      if (currentCategory && targetItem.category !== currentCategory) {
        logs.push(
          createLog(
            'warning',
            `${targetItem.name}: ${qty} ${targetItem.unit} → przypisano do ${targetItem.category} (nie ${currentCategory})`,
          ),
        );
      } else {
        logs.push(
          createLog('success', `${targetItem.name}: ${qty} ${targetItem.unit}`),
        );
      }

      targetItem.qty = qty;
      if (!updatedItemIds.includes(targetItem.id)) {
        updatedItemIds.push(targetItem.id);
      }
    } else {
      quarantineCounter += 1;
      quarantine.push({
        id: `q-${quarantineCounter}`,
        rawLine: cleanLine,
        rawName: itemName,
        qty,
        unit,
        suggestedCategory: currentCategory ?? 'OPAKOWANIA',
        suggestedUnit: unit,
      });
      logs.push(
        createLog('warning', `Nierozpoznane: „${itemName}” (${qty} ${unit})`),
      );
    }
  }

  return { logs, updatedItemIds, quarantine };
}

export function parseAndUpdateInventory(
  rawText: string,
  inventory: InventoryItem[],
): { inventory: InventoryItem[]; result: ParseResult } {
  const workingCopy = inventory.map((item) => ({ ...item }));
  const result = parseMessengerText(rawText, workingCopy);
  return { inventory: workingCopy, result };
}

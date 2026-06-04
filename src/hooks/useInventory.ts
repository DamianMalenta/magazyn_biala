import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_INVENTORY, STORAGE_KEY } from '@/lib/dictionary';
import { parseAndUpdateInventory } from '@/lib/parser';
import type {
  Category,
  InventoryItem,
  ParseResult,
  QuarantineItem,
  Unit,
} from '@/types/inventory';

function loadInventory(): InventoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as InventoryItem[];
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_INVENTORY.map((item) => ({ ...item }));
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(loadInventory);
  const [lastParse, setLastParse] = useState<ParseResult | null>(null);
  const [quarantine, setQuarantine] = useState<QuarantineItem[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  const persist = useCallback((items: InventoryItem[]) => {
    setInventory(items);
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(0, item.qty + delta) }
          : item,
      ),
    );
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, qty) } : item,
      ),
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addItem = useCallback(
    (name: string, category: Category, unit: Unit, qty = 0) => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      setInventory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: trimmed,
          category,
          unit,
          qty,
        },
      ]);
      return true;
    },
    [],
  );

  const parseMessenger = useCallback(
    (rawText: string) => {
      const { inventory: updated, result } = parseAndUpdateInventory(
        rawText,
        inventory,
      );
      setInventory(updated);
      setLastParse(result);
      setQuarantine(result.quarantine);
      return result;
    },
    [inventory],
  );

  const dismissQuarantineItem = useCallback((id: string) => {
    setQuarantine((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resolveQuarantine = useCallback(
    (
      item: QuarantineItem,
      options: { name: string; category: Category; unit: Unit; applyQty: boolean },
    ) => {
      const existing = inventory.find(
        (i) => i.name.toLowerCase() === options.name.toLowerCase(),
      );

      if (existing && options.applyQty) {
        setQty(existing.id, item.qty);
      } else if (!existing) {
        addItem(options.name, options.category, options.unit, options.applyQty ? item.qty : 0);
      }

      dismissQuarantineItem(item.id);
    },
    [addItem, dismissQuarantineItem, inventory, setQty],
  );

  const resetToDefaults = useCallback(() => {
    if (confirm('Przywrócić domyślną bazę towarów? Spowoduje to utratę własnych SKU.')) {
      setInventory(DEFAULT_INVENTORY.map((item) => ({ ...item })));
      setQuarantine([]);
      setLastParse(null);
    }
  }, []);

  return {
    inventory,
    lastParse,
    quarantine,
    changeQty,
    setQty,
    deleteItem,
    addItem,
    parseMessenger,
    dismissQuarantineItem,
    resolveQuarantine,
    resetToDefaults,
    persist,
  };
}

export type InventoryStore = ReturnType<typeof useInventory>;

import { RAW_UNIT_MAP, SORTED_ALIASES } from './dictionary';
import type { Unit } from '@/types/inventory';

const LEADING_QTY = /^(\d+(?:[.,]\d+)?)\s*(?:x\s*)?/i;

const UNIT_PREFIX =
  /^(x|kg\.?|g|op\.?|opakowanie|opakowania|opakowań|opakowan|worek|worki|pojemnik|pojemniki|paczka|paczki|szt(?:uk|uki)?\.?)\s+/i;

export interface ExtractedQuantity {
  qty: number;
  rawUnit: string | null;
  unit: Unit;
  itemName: string;
}

function normalizeRawUnitToken(token: string | undefined): string | null {
  if (!token) return null;
  return token.toLowerCase().replace(/\.$/, '').trim();
}

export function mapRawUnitToStandard(rawUnit: string | null): Unit {
  if (!rawUnit) return 'szt.';
  return RAW_UNIT_MAP[rawUnit] ?? 'szt.';
}

function matchesAnyAlias(text: string): boolean {
  const lower = text.toLowerCase();
  return SORTED_ALIASES.some(({ alias }) => lower.includes(alias));
}

function inferUnitFromLine(line: string): Unit | null {
  const lower = line.toLowerCase();
  if (/\d+(?:[.,]\d+)?\s*kg\b/.test(lower)) return 'kg.';
  if (/\d+(?:[.,]\d+)?\s*(?:op\.?\b|opakowań|opakowan|opakowanie)/.test(lower)) {
    return 'opak.';
  }
  return null;
}

function stripTrailingUnitWords(name: string): string {
  return name
    .replace(/\s+(worek|worki|pojemnik|pojemniki|paczka|paczki)$/i, '')
    .trim();
}

export function extractQuantityAndName(line: string): ExtractedQuantity {
  const trimmed = line.trim();
  let qty = 1;
  let rest = trimmed;

  const qtyMatch = trimmed.match(LEADING_QTY);
  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1].replace(',', '.'));
    rest = trimmed.slice(qtyMatch[0].length).trim();
  }

  const unitMatch = rest.match(UNIT_PREFIX);
  if (unitMatch) {
    const rawUnit = normalizeRawUnitToken(unitMatch[1]);
    const afterUnit = rest.slice(unitMatch[0].length).trim();

    // Unit token is part of the product name (e.g. "opakowań na makarony")
    if (matchesAnyAlias(rest) && !matchesAnyAlias(afterUnit)) {
      const unit = inferUnitFromLine(trimmed) ?? mapRawUnitToStandard(rawUnit);
      return { qty, rawUnit: null, unit, itemName: rest };
    }

    const finalQty = rawUnit === 'g' ? qty / 1000 : qty;
    return {
      qty: finalQty,
      rawUnit,
      unit: mapRawUnitToStandard(rawUnit),
      itemName: stripTrailingUnitWords(afterUnit || rest),
    };
  }

  if (matchesAnyAlias(rest)) {
    const unit = inferUnitFromLine(trimmed) ?? 'szt.';
    return { qty, rawUnit: null, unit, itemName: rest };
  }

  return {
    qty,
    rawUnit: null,
    unit: inferUnitFromLine(trimmed) ?? 'szt.',
    itemName: stripTrailingUnitWords(rest),
  };
}

export function formatUnitDisplay(unit: Unit): string {
  return unit;
}

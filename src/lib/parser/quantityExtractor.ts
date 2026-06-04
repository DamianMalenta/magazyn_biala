import type { StandardUOM } from '../../types/inventory'
import { TRAILING_UNIT_PATTERN } from '../data/dictionary'
import { isRawUnitToken, normalizeUOM, stripUnitTokensFromName } from './uomNormalizer'

export interface ExtractedLine {
  qty: number
  rawUnit: string | null
  unit: StandardUOM
  rawName: string
  cleanName: string
}

const LEADING_QTY_PATTERN =
  /^(\d+(?:[.,]\d+)?)\s*(x|kg|g|l|ml|op|opakowanie|opakowań|opakowan|opakowania|worek|worki|pojemnik|pojemniki|paczka|paczki|szt(?:uk|uki|ućce|uce)?|kartony?|karton)?\s*(.*)$/i

const UNIT_IS_PRODUCT_NAME =
  /^(opakowań|opakowan|opakowania|opakowanie|sztućce|sztuce|pojemnik|pojemniki)$/i

function rejoinNameWhenUnitIsProduct(
  trimmed: string,
  rawUnit: string | null,
  rawName: string,
): { rawUnit: string | null; rawName: string } {
  if (!rawUnit || !UNIT_IS_PRODUCT_NAME.test(rawUnit)) {
    return { rawUnit, rawName }
  }

  if (/^(na|do|dla|\()/i.test(rawName) || /sztućce|sztuce/i.test(rawUnit)) {
    return {
      rawUnit: null,
      rawName: trimmed.replace(/^\d+(?:[.,]\d+)?\s*/i, '').trim(),
    }
  }

  return { rawUnit, rawName }
}

export function extractQuantityAndName(line: string): ExtractedLine {
  const trimmed = line.trim()
  let qty = 1
  let rawUnit: string | null = null
  let rawName = trimmed

  const match = trimmed.match(LEADING_QTY_PATTERN)
  if (match) {
    qty = parseFloat(match[1].replace(',', '.'))
    rawUnit = match[2]?.toLowerCase() ?? null
    rawName = match[3]?.trim() || trimmed

    const rejoined = rejoinNameWhenUnitIsProduct(trimmed, rawUnit, rawName)
    rawUnit = rejoined.rawUnit
    rawName = rejoined.rawName
  }

  if (!rawUnit) {
    const trailing = rawName.match(TRAILING_UNIT_PATTERN)
    if (trailing) {
      rawUnit = trailing[1].toLowerCase()
      rawName = rawName.replace(TRAILING_UNIT_PATTERN, '').trim()
    }
  }

  if (rawUnit === 'g' && qty >= 100) {
    qty = qty / 1000
    rawUnit = 'kg'
  }

  const unit = normalizeUOM(rawUnit)
  let cleanName = stripUnitTokensFromName(rawName)

  if (!cleanName && rawName) {
    cleanName = rawName
  }

  if (rawUnit && isRawUnitToken(rawUnit) && !match?.[3]?.trim()) {
    cleanName = stripUnitTokensFromName(trimmed.replace(/^\d+(?:[.,]\d+)?\s*/i, ''))
  }

  return {
    qty,
    rawUnit,
    unit,
    rawName: rawName || trimmed,
    cleanName: cleanName || rawName || trimmed,
  }
}

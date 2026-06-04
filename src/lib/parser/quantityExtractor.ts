import type { StandardUOM } from '../../types/inventory'
import type { ParserConfig } from '../../types/config'
import {
  buildLeadingQtyPattern,
  buildTrailingUnitPattern,
  buildUnitAsProductPattern,
} from './parserHelpers'
import { isRawUnitToken, normalizeUOM, stripUnitTokensFromName } from './uomNormalizer'

export interface ExtractedLine {
  qty: number
  rawUnit: string | null
  unit: StandardUOM
  rawName: string
  cleanName: string
}

function rejoinNameWhenUnitIsProduct(
  trimmed: string,
  rawUnit: string | null,
  rawName: string,
  config: ParserConfig,
): { rawUnit: string | null; rawName: string } {
  const unitAsProduct = buildUnitAsProductPattern(config.unitAsProductName)

  if (!rawUnit || !unitAsProduct.test(rawUnit)) {
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

export function extractQuantityAndName(line: string, config: ParserConfig): ExtractedLine {
  const trimmed = line.trim()
  let qty = 1
  let rawUnit: string | null = null
  let rawName = trimmed

  const leadingPattern = buildLeadingQtyPattern(config.rawUnitTokens)
  const trailingPattern = buildTrailingUnitPattern(config.rawUnitTokens)

  const match = trimmed.match(leadingPattern)
  if (match) {
    qty = parseFloat(match[1].replace(',', '.'))
    rawUnit = match[2]?.toLowerCase() ?? null
    rawName = match[3]?.trim() || trimmed

    const rejoined = rejoinNameWhenUnitIsProduct(trimmed, rawUnit, rawName, config)
    rawUnit = rejoined.rawUnit
    rawName = rejoined.rawName
  }

  if (!rawUnit) {
    const trailing = rawName.match(trailingPattern)
    if (trailing) {
      rawUnit = trailing[1].toLowerCase()
      rawName = rawName.replace(trailingPattern, '').trim()
    }
  }

  if (rawUnit === 'g' && qty >= 100) {
    qty = qty / 1000
    rawUnit = 'kg'
  }

  const unit = normalizeUOM(rawUnit, config)
  let cleanName = stripUnitTokensFromName(rawName, config)

  if (!cleanName && rawName) {
    cleanName = rawName
  }

  if (rawUnit && isRawUnitToken(rawUnit, config) && !match?.[3]?.trim()) {
    cleanName = stripUnitTokensFromName(trimmed.replace(/^\d+(?:[.,]\d+)?\s*/i, ''), config)
  }

  return {
    qty,
    rawUnit,
    unit,
    rawName: rawName || trimmed,
    cleanName: cleanName || rawName || trimmed,
  }
}

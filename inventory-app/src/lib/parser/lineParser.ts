import type { StandardUom } from '@/types/inventory'
import { normalizePolish } from '@/lib/utils'
import { normalizeUom, stripTrailingUnitTokens } from './uomNormalizer'

export interface ExtractedLine {
  qty: number
  rawUnit: string | undefined
  uom: StandardUom
  productName: string
}

const META_PATTERNS = [
  /^magazyn\b/i,
  /\baktualizacja\b/i,
  /\bostatnia\b/i,
  /^\d{1,2}[./]\d{1,2}/,
  /\b\d{1,2}:\d{2}\b/,
]

const QTY_LINE_REGEX =
  /^(\d+(?:[.,]\d+)?)\s*(?:x|×|\*)?\s*(kg\.?|g\b|szt\.?|sztuk(?:i|a)?|op\.?|opakowan(?:ia|ie|a|ów)?|worek|worki|pojemnik|pojemniki|paczk[aię]?)?\s*(.*)$/i

const QTY_KG_SUFFIX_REGEX = /^(\d+(?:[.,]\d+)?)\s*kg\.?\s+(.+)$/i

export function isMetaLine(line: string): boolean {
  const lower = line.toLowerCase()
  return META_PATTERNS.some((p) => p.test(lower))
}

export function extractLineData(line: string): ExtractedLine {
  const trimmed = line.trim()
  if (!trimmed) {
    return { qty: 1, rawUnit: undefined, uom: 'szt.', productName: '' }
  }

  const kgMatch = trimmed.match(QTY_KG_SUFFIX_REGEX)
  if (kgMatch) {
    const qty = parseFloat(kgMatch[1].replace(',', '.'))
    const productName = stripTrailingUnitTokens(kgMatch[2].trim())
    return { qty, rawUnit: 'kg', uom: 'kg.', productName }
  }

  const match = trimmed.match(QTY_LINE_REGEX)
  if (match) {
    const qty = parseFloat(match[1].replace(',', '.'))
    const rawUnit = match[2]?.trim() || undefined
    let productName = (match[3] ?? '').trim()

    if (!productName && rawUnit) {
      productName = rawUnit
      return {
        qty,
        rawUnit: undefined,
        uom: 'szt.',
        productName: stripTrailingUnitTokens(productName),
      }
    }

    const uom = normalizeUom(rawUnit)
    return {
      qty,
      rawUnit,
      uom,
      productName: stripTrailingUnitTokens(productName),
    }
  }

  return {
    qty: 1,
    rawUnit: undefined,
    uom: 'szt.',
    productName: stripTrailingUnitTokens(trimmed),
  }
}

export function looksLikeInventoryItem(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (/^\d/.test(trimmed)) return true
  const normalized = normalizePolish(trimmed)
  const itemHints = [
    'worek',
    'pojemnik',
    'kg',
    'nugetsy',
    'ser',
    'salami',
    'frytki',
    'krewetki',
    'poledwiczki',
    'polędwiczki',
    'jogurt',
    'sos',
    'wieczka',
    'sztucce',
    'sztućce',
  ]
  return itemHints.some((hint) => normalized.includes(hint))
}

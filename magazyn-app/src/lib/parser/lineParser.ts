import { normalizeUnitToken } from '../units'
import type { StandardUnit } from '../types'
import { stripPunctuation } from '../normalize'

export interface ParsedLine {
  qty: number
  unit: StandardUnit
  rawName: string
  hadExplicitQty: boolean
}

/** Unit tokens only — exclude opakowań/opakowan (often part of product names) */
const QTY_UNIT_NAME =
  /^(\d+(?:[.,]\d+)?)\s*(x|kg\.?|g|szt\.?|sztuk(?:i|a|ę)?|sztuce|sztućce|opakowanie|worek|worki|pojemnik|pojemniki|paczki?)?\s*(.+)$/i

const TRAILING_UNIT =
  /^(.+?)\s+(worek|worki|kg\.?|g|pojemnik|pojemniki|opakowanie|paczki?)\s*$/i

export function parseLineQuantity(line: string): ParsedLine {
  const clean = stripPunctuation(line.trim())
  if (!clean) {
    return { qty: 1, unit: 'szt.', rawName: '', hadExplicitQty: false }
  }

  const match = clean.match(QTY_UNIT_NAME)
  if (match) {
    const qty = parseFloat(match[1].replace(',', '.'))
    const unit = normalizeUnitToken(match[2] || undefined)
    const rawName = match[3].trim()
    return { qty, unit, rawName, hadExplicitQty: true }
  }

  const trailing = clean.match(TRAILING_UNIT)
  if (trailing) {
    return {
      qty: 1,
      unit: normalizeUnitToken(trailing[2]),
      rawName: trailing[1].trim(),
      hadExplicitQty: false,
    }
  }

  return { qty: 1, unit: 'szt.', rawName: clean, hadExplicitQty: false }
}

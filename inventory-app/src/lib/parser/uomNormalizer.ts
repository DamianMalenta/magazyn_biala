import type { StandardUom } from '@/types/inventory'
import { normalizePolish } from '@/lib/utils'

const UOM_TO_STANDARD: Record<string, StandardUom> = {
  x: 'szt.',
  szt: 'szt.',
  'szt.': 'szt.',
  sztuk: 'szt.',
  sztuki: 'szt.',
  sztuka: 'szt.',
  kg: 'kg.',
  'kg.': 'kg.',
  g: 'kg.',
  op: 'opak.',
  'op.': 'opak.',
  opakowanie: 'opak.',
  opakowania: 'opak.',
  opakowan: 'opak.',
  opakowań: 'opak.',
  opakowaniach: 'opak.',
  worek: 'opak.',
  worki: 'opak.',
  pojemnik: 'opak.',
  pojemniki: 'opak.',
  paczka: 'opak.',
  paczki: 'opak.',
  paczke: 'opak.',
  karton: 'opak.',
  kartony: 'opak.',
}

export function normalizeUom(raw: string | undefined): StandardUom {
  if (!raw) return 'szt.'
  const key = normalizePolish(raw)
  return UOM_TO_STANDARD[key] ?? 'szt.'
}

/** Strip unit tokens that may remain in product name after regex capture */
export function stripTrailingUnitTokens(name: string): string {
  const tokens = [
    'worek',
    'worki',
    'pojemnik',
    'pojemniki',
    'opakowanie',
    'opakowan',
    'opakowania',
    'paczka',
    'paczki',
  ]
  let result = name.trim()
  for (const token of tokens) {
    const re = new RegExp(`\\s+${token}\\s*$`, 'i')
    result = result.replace(re, '').trim()
  }
  return result
}

import type { StandardUOM } from '../../types/inventory'
import { RAW_UNIT_TOKENS } from '../data/dictionary'

const UOM_MAP: Record<string, StandardUOM> = {
  x: 'szt.',
  szt: 'szt.',
  sztuk: 'szt.',
  sztuki: 'szt.',
  sztuce: 'szt.',
  'sztućce': 'szt.',
  kg: 'kg.',
  g: 'kg.',
  op: 'opak.',
  opakowanie: 'opak.',
  opakowan: 'opak.',
  opakowań: 'opak.',
  opakowania: 'opak.',
  paczka: 'opak.',
  paczki: 'opak.',
  worek: 'opak.',
  worki: 'opak.',
  pojemnik: 'opak.',
  pojemniki: 'opak.',
  karton: 'opak.',
  kartony: 'opak.',
}

export function normalizeUOM(rawUnit: string | undefined | null): StandardUOM {
  if (!rawUnit) return 'szt.'
  const key = rawUnit.toLowerCase().trim()
  return UOM_MAP[key] ?? 'szt.'
}

export function isRawUnitToken(token: string): boolean {
  const normalized = token.toLowerCase()
  return RAW_UNIT_TOKENS.some((u) => u.toLowerCase() === normalized)
}

export function stripUnitTokensFromName(name: string): string {
  let cleaned = name.trim()
  for (const token of RAW_UNIT_TOKENS) {
    const pattern = new RegExp(`\\b${token}\\b`, 'gi')
    cleaned = cleaned.replace(pattern, ' ')
  }
  return cleaned.replace(/\s+/g, ' ').trim()
}

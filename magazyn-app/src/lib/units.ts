import type { StandardUnit } from './types'

/** Raw token from messenger → standard UOM */
const UNIT_MAP: Record<string, StandardUnit> = {
  kg: 'kg.',
  kilogram: 'kg.',
  kilogramow: 'kg.',
  g: 'kg.', // treat grams line as kg domain; qty stays as typed
  szt: 'szt.',
  sztuk: 'szt.',
  sztuki: 'szt.',
  sztuce: 'szt.',
  sztucce: 'szt.',
  x: 'opak.',
  op: 'opak.',
  opakowanie: 'opak.',
  opakowania: 'opak.',
  opakowan: 'opak.',
  opakowań: 'opak.',
  worek: 'opak.',
  worki: 'opak.',
  worekow: 'opak.',
  pojemnik: 'opak.',
  pojemniki: 'opak.',
  pojemnikow: 'opak.',
  paczka: 'opak.',
  paczki: 'opak.',
  paczek: 'opak.',
}

export function normalizeUnitToken(raw: string | undefined): StandardUnit {
  if (!raw) return 'szt.'
  const key = raw.toLowerCase().replace(/\./g, '')
  return UNIT_MAP[key] ?? 'szt.'
}

export function formatUnit(unit: StandardUnit): string {
  return unit
}

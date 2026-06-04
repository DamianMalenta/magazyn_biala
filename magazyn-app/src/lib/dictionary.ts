import type { Category } from './types'

export const STORAGE_KEY = 'magazyn_baza_v3'

export const IGNORE_LINE_PATTERNS = [
  /^magazyn\b/i,
  /\baktualizacja\b/i,
  /\bostatnia\b/i,
  /^\d{1,2}[./]\d{1,2}/, // date fragments like 04.06
  /^\d{1,2}:\d{2}\s*$/ // lone time
]

export const CATEGORY_ALIASES: Record<Category, string[]> = {
  LODÓWKA: ['lodowka', 'lodówka', 'chlodnia', 'chłodnia', 'lodowke'],
  ZAMRAŻARKA: [
    'zamrazarka',
    'zamrażarka',
    'zamrazalnik',
    'zamrażalnik',
    'zamrazalnika',
    'mrozarka',
    'mrożarka',
    'zamrozarka',
  ],
  OPAKOWANIA: ['opakowania', 'opakowanie', 'kartony', 'opakowan'],
}

/** Canonical SKU name → aliases (longest-match wins via sort) */
export const SKU_ALIASES: Record<string, string[]> = {
  Nugetsy: ['nugetsy', 'nuggets', 'nugersy', 'nugets'],
  Skrzydełka: ['skrzydelka', 'skrzydełka', 'skrzydla', 'skrzydła'],
  Szyszki: ['szyszki', 'szyszka'],
  Papryka: ['papryka worek', 'papryka'],
  'Polędwiczki surowe': [
    'poledwiczki surowe worek',
    'poledwiczki surowe',
    'poledwiczki',
    'poledwica surowa',
  ],
  Krewetki: [
    'pojemnik krewetek',
    'pojemniki krewetek',
    'krewetek',
    'krewetki',
    'krewetka',
  ],
  Frytki: ['frytki', 'frytka'],
  'Jogurt grecki': ['jogurt grecki', 'jogurt grecki', 'jogurt'],
  'Ser Mozzarella': ['ser mozzarella', 'mozzarella', 'ser mozarella', '10kg ser'],
  Salami: ['salami zwykle', 'salami zwykłe', 'salami'],
  'Sos czosnkowy': ['sos czosnkowy', 'sos czosnkowy', 'czosnkowy'],
  'Kartony małe': ['kartony male', 'kartony małe', 'karton male', 'karton maly'],
  'Opakowania na makarony': [
    'opakowan na makarony',
    'opakowań na makarony',
    'opakowania na makarony',
    'opakowanie na makarony',
  ],
  'Wieczka na makarony': [
    'wieczka na makarony',
    'wiecka na makarony',
    'wiecza na makarony',
    'wieczko na makarony',
  ],
  'Sztućce (łyżka i nóż)': [
    'sztuce',
    'sztućce',
    'lyzka i noz',
    'łyżka i nóż',
    'sztuce lyzka',
  ],
}

export interface SortedAlias {
  canonical: string
  alias: string
  aliasNorm: string
}

export function buildSortedAliases(): SortedAlias[] {
  const list: SortedAlias[] = []
  for (const [canonical, aliases] of Object.entries(SKU_ALIASES)) {
    for (const alias of aliases) {
      const aliasNorm = alias.toLowerCase()
      list.push({ canonical, alias, aliasNorm })
    }
  }
  return list.sort((a, b) => b.aliasNorm.length - a.aliasNorm.length)
}

export const SORTED_ALIASES = buildSortedAliases()

import type { Category } from '../../types/inventory'

export const CATEGORY_ALIASES: Record<Category, string[]> = {
  LODÓWKA: ['lodówka', 'lodowka', 'chłodnia', 'chlodnia'],
  ZAMRAŻARKA: ['zamrażarka', 'zamrazarka', 'zamrażalnik', 'zamrazalnik', 'zamrażalnik'],
  OPAKOWANIA: ['opakowania', 'opakowanie', 'kartony', 'karton'],
}

export const IGNORE_LINE_KEYWORDS = ['magazyn', 'aktualizacja', 'ostatnia', 'inwentaryzacja']

export const SKU_ALIASES: Record<string, string[]> = {
  Nugetsy: ['nugetsy', 'nuggets', 'nugersy', 'nuggetsy'],
  'Skrzydełka': ['skrzydełka', 'skrzydelka', 'skrzydła', 'skrzydla'],
  Szyszki: ['szyszki', 'szyszka'],
  Papryka: ['papryka worek', 'papryka'],
  'Polędwiczki surowe': ['poledwiczki surowe worek', 'poledwiczki surowe', 'poledwiczki'],
  Krewetki: ['pojemnik krewetek', 'krewetek', 'krewetki'],
  Frytki: ['frytki', 'frytki mrożone', 'frytki mrozone'],
  'Jogurt grecki': ['jogurt grecki', 'jogurt'],
  'Ser Mozzarella': ['ser mozzarella', '10kg ser', 'mozzarella'],
  Salami: ['salami zwykle', 'salami zwykłe', 'salami'],
  'Sos czosnkowy': ['sos czosnkowy', 'sos czosnk', 'czosnkowy'],
  'Kartony małe': ['kartony małe', 'kartony male', 'karton mały', 'karton maly'],
  'Opakowania na makarony': ['opakowania na makarony', 'opakowan na makarony', 'opakowania makaron'],
  'Wieczka na makarony': ['wieczka na makarony', 'wieczka makaron', 'wieczka'],
  'Sztućce (łyżka i nóż)': ['sztućce', 'sztuce', 'łyżka i nóż', 'lyzka i noz'],
}

/** Raw unit tokens found in Messenger text → standard UOM */
export const RAW_UNIT_TOKENS = [
  'opakowań',
  'opakowan',
  'opakowanie',
  'opakowania',
  'pojemniki',
  'pojemnik',
  'paczki',
  'paczka',
  'kartony',
  'karton',
  'worki',
  'worek',
  'sztuk',
  'sztuki',
  'sztućce',
  'sztuce',
  'szt',
  'kg',
  'op',
  'x',
] as const

export const TRAILING_UNIT_PATTERN = new RegExp(
  `\\b(${RAW_UNIT_TOKENS.join('|')})\\s*$`,
  'i',
)

import type { Category } from '../../types/inventory'

export const CATEGORY_ALIASES: Record<Category, string[]> = {
  LODÓWKA: ['lodówka', 'lodowka', 'chłodnia', 'chlodnia'],
  ZAMRAŻARKA: [
    'zamrażarka',
    'zamrazarka',
    'zamrazalka',
    'zamrażalnik',
    'zamrazalnik',
    'mrożarka',
    'mrozarka',
  ],
  OPAKOWANIA: ['opakowania', 'opakowanie'],
}

export const IGNORE_LINE_KEYWORDS = ['magazyn', 'aktualizacja', 'ostatnia', 'inwentaryzacja']

export const SKU_ALIASES: Record<string, string[]> = {
  Nugetsy: ['nugetsy', 'nuggets', 'nugersy', 'nuggetsy'],
  Skrzydełka: ['skrzydełka', 'skrzydelka', 'skrzydła', 'skrzydla'],
  Szyszki: ['szyszki', 'szyszka', 'szyszki ziemniaczane', 'szyszki ziemniaczane'],
  Papryka: ['papryka worek', 'papryka'],
  'Polędwiczki surowe': [
    'kuweta polędwiczki',
    'kuweta poledwiczki',
    'poledwiczki surowe worek',
    'poledwiczki surowe',
    'poledwiczki',
    'polędwiczki',
  ],
  Krewetki: ['pojemnik krewetek', 'krewetek', 'krewetki'],
  Frytki: ['frytki', 'frytki mrożone', 'frytki mrozone'],
  'Jogurt grecki': ['jogurt grecki', 'jogurt'],
  'Ser Mozzarella': ['ser mozzarella', '10kg ser', 'mozzarella'],
  Salami: ['salami zwykle', 'salami zwykłe', 'salami'],
  'Salami pikantne': ['salami pikanterii', 'salami pikantne', 'pikanterii'],
  'Rwana wieprzowina': ['rwana wieprzowina', 'rwana wieprzowina'],
  'Pekińska kapusta': ['pekińska kapusta', 'pekinska kapusta', 'kapusta pekińska'],
  'Lodowa sałata': ['lodowa sałata', 'lodowa salata', 'sałata lodowa'],
  'Sos czosnkowy': ['sos czosnkowy', 'sos czosnk', 'czosnkowy'],
  'Kartony małe': ['kartony małe', 'kartony male', 'karton mały', 'karton maly'],
  'Kartony duże': ['kartony duży', 'kartony duze', 'kartony duże', 'karton duży'],
  'Kartony pizzerinki': ['kartony pizzerinki', 'pizzerinki', 'karton pizzerinki'],
  'Kartony zapiekanki': ['kartony zapiekanki', 'zapiekanki', 'karton zapiekanki'],
  'Frytki małe': ['frytki male', 'frytki małe', 'frytki male opak'],
  'Frytki duże': ['frytki duze', 'frytki duże', 'frytki duze opak'],
  'Opakowania na makarony': [
    'opakowania na makarony',
    'opakowania makarony',
    'opakowan na makarony',
    'opakowania makaron',
    '6x opakowania makarony',
  ],
  'Wieczka na makarony': [
    'wieczka na makarony',
    'wieczka makarony',
    'wieczka makaron',
    '6x wieczka makarony',
  ],
  Serwetki: ['serwetki', 'karton serwetki', 'serwetki dyspenser'],
  'Sztućce (łyżka i nóż)': ['sztućce', 'sztuce', 'łyżka i nóż', 'lyzka i noz'],
}

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

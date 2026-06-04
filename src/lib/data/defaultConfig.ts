import type { AppConfig } from '../../types/config'
import { createId } from '../utils/text'

export const CONFIG_STORAGE_KEY = 'magazyn_config_v1'

export const DEFAULT_APP_CONFIG: AppConfig = {
  version: 1,
  categories: [
    {
      id: 'cat-lodowka',
      name: 'LODÓWKA',
      aliases: ['lodówka', 'lodowka', 'chłodnia', 'chlodnia'],
      theme: {
        label: 'Lodówka',
        accent: 'text-sky-400',
        border: 'border-sky-500/30',
        bg: 'bg-sky-500/5',
        icon: '❄️',
      },
    },
    {
      id: 'cat-zamrazarka',
      name: 'ZAMRAŻARKA',
      aliases: ['zamrażarka', 'zamrazarka', 'zamrażalnik', 'zamrazalnik'],
      theme: {
        label: 'Zamrażarka',
        accent: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/5',
        icon: '🧊',
      },
    },
    {
      id: 'cat-opakowania',
      name: 'OPAKOWANIA',
      aliases: ['opakowania', 'opakowanie', 'kartony', 'karton'],
      theme: {
        label: 'Opakowania',
        accent: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/5',
        icon: '📦',
      },
    },
  ],
  ignoreLineKeywords: ['magazyn', 'aktualizacja', 'ostatnia', 'inwentaryzacja'],
  skuAliases: {
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
    'Opakowania na makarony': [
      'opakowania na makarony',
      'opakowan na makarony',
      'opakowania makaron',
    ],
    'Wieczka na makarony': ['wieczka na makarony', 'wieczka makaron', 'wieczka'],
    'Sztućce (łyżka i nóż)': ['sztućce', 'sztuce', 'łyżka i nóż', 'lyzka i noz'],
  },
  standardUoms: ['kg.', 'szt.', 'opak.'],
  uomMappings: {
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
  },
  rawUnitTokens: [
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
  ],
  unitAsProductName: [
    'opakowań',
    'opakowan',
    'opakowania',
    'opakowanie',
    'sztućce',
    'sztuce',
    'pojemnik',
    'pojemniki',
  ],
  fuzzyMatchEnabled: true,
  fuzzyMatchMaxDistance: 2,
}

export function createCategoryId(): string {
  return createId('cat')
}

export function buildParserConfig(config: AppConfig) {
  const categoryAliases: Record<string, string[]> = {}
  for (const cat of config.categories) {
    categoryAliases[cat.name] = cat.aliases
  }

  const defaultCategory =
    config.categories.find((c) => c.name === 'OPAKOWANIA')?.name ??
    config.categories[0]?.name ??
    'OPAKOWANIA'

  return {
    categoryAliases,
    ignoreLineKeywords: config.ignoreLineKeywords,
    skuAliases: config.skuAliases,
    uomMappings: config.uomMappings,
    rawUnitTokens: config.rawUnitTokens,
    unitAsProductName: config.unitAsProductName,
    defaultCategory,
    fuzzyMatchEnabled: config.fuzzyMatchEnabled,
    fuzzyMatchMaxDistance: config.fuzzyMatchMaxDistance,
  }
}

export function getCategoryNames(config: AppConfig): string[] {
  return config.categories.map((c) => c.name)
}

export function getCategoryTheme(config: AppConfig, name: string) {
  return config.categories.find((c) => c.name === name)?.theme
}

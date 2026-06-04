import type { Category, InventoryItem, Unit } from '@/types/inventory';

export const STORAGE_KEY = 'magazyn_baza_v3';

export const IGNORE_LINE_PATTERNS = ['magazyn', 'aktualizacja', 'ostatnia', 'biała', 'biala'];

export const CATEGORY_ALIASES: Record<Category, string[]> = {
  LODÓWKA: ['lodówka', 'lodowka', 'chłodnia', 'chlodnia'],
  ZAMRAŻARKA: ['zamrażarka', 'zamrazarka', 'zamrażalnik', 'zamrazalnik'],
  OPAKOWANIA: ['opakowania', 'kartony'],
};

/** Canonical SKU name → sorted aliases (longest match wins at runtime) */
export const SKU_ALIASES: Record<string, string[]> = {
  Nugetsy: ['nugetsy', 'nuggets', 'nugersy'],
  Skrzydełka: ['skrzydełka', 'skrzydelka', 'skrzydła', 'skrzydla'],
  Szyszki: ['szyszki', 'szyszka'],
  Papryka: ['papryka worek', 'papryka'],
  'Polędwiczki surowe': ['poledwiczki surowe worek', 'poledwiczki surowe', 'poledwiczki', 'polędwiczki surowe'],
  Krewetki: ['pojemnik krewetek', 'krewetek', 'krewetki'],
  Frytki: ['frytki'],
  'Jogurt grecki': ['jogurt grecki', 'jogurt'],
  'Ser Mozzarella': ['ser mozzarella', 'mozzarella', '10kg ser'],
  Salami: ['salami zwykle', 'salami zwykłe', 'salami'],
  'Kartony małe': ['kartony małe', 'kartony male', 'kartony'],
  'Opakowania na makarony': ['opakowań na makarony', 'opakowan na makarony', 'opakowania na makarony'],
  'Wieczka na makarony': ['wieczka na makarony', 'wieczka na makarony'],
};

export interface SortedAlias {
  canonical: string;
  alias: string;
}

export function buildSortedAliases(): SortedAlias[] {
  const entries: SortedAlias[] = [];
  for (const [canonical, aliases] of Object.entries(SKU_ALIASES)) {
    for (const alias of aliases) {
      entries.push({ canonical, alias: alias.toLowerCase() });
    }
  }
  return entries.sort((a, b) => b.alias.length - a.alias.length);
}

export const SORTED_ALIASES = buildSortedAliases();

export const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Nugetsy', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: '2', name: 'Skrzydełka', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: '3', name: 'Szyszki', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: '4', name: 'Papryka', category: 'ZAMRAŻARKA', unit: 'szt.', qty: 0 },
  { id: '5', name: 'Polędwiczki surowe', category: 'ZAMRAŻARKA', unit: 'szt.', qty: 0 },
  { id: '6', name: 'Krewetki', category: 'ZAMRAŻARKA', unit: 'szt.', qty: 0 },
  { id: '7', name: 'Frytki', category: 'ZAMRAŻARKA', unit: 'kg.', qty: 0 },
  { id: '8', name: 'Jogurt grecki', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: '9', name: 'Ser Mozzarella', category: 'LODÓWKA', unit: 'kg.', qty: 0 },
  { id: '10', name: 'Salami', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: '11', name: 'Kartony małe', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: '12', name: 'Opakowania na makarony', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: '13', name: 'Wieczka na makarony', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
];

/** Raw unit tokens from Messenger → standard Unit */
export const RAW_UNIT_MAP: Record<string, Unit> = {
  x: 'szt.',
  szt: 'szt.',
  sztuk: 'szt.',
  sztuki: 'szt.',
  sztućce: 'szt.',
  sztuce: 'szt.',
  worek: 'szt.',
  worki: 'szt.',
  pojemnik: 'szt.',
  pojemniki: 'szt.',
  paczka: 'szt.',
  paczki: 'szt.',
  kg: 'kg.',
  g: 'kg.',
  op: 'opak.',
  opakowanie: 'opak.',
  opakowania: 'opak.',
  opakowań: 'opak.',
  opakowan: 'opak.',
};

export function normalizePolish(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');
}

export function detectCategory(line: string): Category | null {
  const normalized = normalizePolish(line.trim());
  if (!normalized) return null;

  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES) as [Category, string[]][]) {
    if (aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
      return category;
    }
  }
  return null;
}

export function isIgnoredLine(line: string): boolean {
  const normalized = normalizePolish(line);
  return IGNORE_LINE_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function resolveCanonicalName(rawName: string): string {
  const lower = rawName.toLowerCase();
  for (const { canonical, alias } of SORTED_ALIASES) {
    if (lower.includes(alias)) {
      return canonical;
    }
  }
  return rawName.trim();
}

export function findInventoryItem(
  inventory: InventoryItem[],
  rawName: string,
  canonicalName: string,
): InventoryItem | undefined {
  const lowerRaw = rawName.toLowerCase();
  const lowerCanonical = canonicalName.toLowerCase();

  return inventory.find(
    (item) =>
      item.name.toLowerCase() === lowerCanonical ||
      item.name.toLowerCase() === lowerRaw,
  );
}

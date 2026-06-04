import type { InventoryItem } from '@/types/inventory'

export const STORAGE_KEY = 'magazyn_inventory_v3'

export const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'sku-nugetsy', name: 'Nugetsy', category: 'ZAMRAŻARKA', uom: 'opak.', qty: 0 },
  { id: 'sku-skrzydelka', name: 'Skrzydełka', category: 'ZAMRAŻARKA', uom: 'opak.', qty: 0 },
  { id: 'sku-szyszki', name: 'Szyszki', category: 'ZAMRAŻARKA', uom: 'opak.', qty: 0 },
  { id: 'sku-papryka', name: 'Papryka', category: 'ZAMRAŻARKA', uom: 'opak.', qty: 0 },
  {
    id: 'sku-poledwiczki',
    name: 'Polędwiczki surowe',
    category: 'ZAMRAŻARKA',
    uom: 'opak.',
    qty: 0,
  },
  { id: 'sku-krewetki', name: 'Krewetki', category: 'ZAMRAŻARKA', uom: 'opak.', qty: 0 },
  { id: 'sku-frytki', name: 'Frytki', category: 'ZAMRAŻARKA', uom: 'kg.', qty: 0 },
  { id: 'sku-jogurt', name: 'Jogurt grecki', category: 'LODÓWKA', uom: 'szt.', qty: 0 },
  { id: 'sku-mozzarella', name: 'Ser Mozzarella', category: 'LODÓWKA', uom: 'kg.', qty: 0 },
  { id: 'sku-salami', name: 'Salami', category: 'LODÓWKA', uom: 'szt.', qty: 0 },
  { id: 'sku-sos-czosnkowy', name: 'Sos czosnkowy', category: 'LODÓWKA', uom: 'szt.', qty: 0 },
  { id: 'sku-kartony-male', name: 'Kartony małe', category: 'OPAKOWANIA', uom: 'opak.', qty: 0 },
  {
    id: 'sku-opak-makaron',
    name: 'Opakowania na makarony',
    category: 'OPAKOWANIA',
    uom: 'opak.',
    qty: 0,
  },
  {
    id: 'sku-wieczka-makaron',
    name: 'Wieczka na makarony',
    category: 'OPAKOWANIA',
    uom: 'opak.',
    qty: 0,
  },
  { id: 'sku-sztucce', name: 'Sztućce (łyżka i nóż)', category: 'OPAKOWANIA', uom: 'opak.', qty: 0 },
]

export const DEFAULT_ALIASES: Record<string, string[]> = {
  'sku-nugetsy': ['nugetsy', 'nuggets', 'nugersy', 'nugetsy'],
  'sku-skrzydelka': ['skrzydelka', 'skrzydełka', 'skrzydla', 'skrzydła'],
  'sku-szyszki': ['szyszki', 'szyszka'],
  'sku-papryka': ['papryka worek', 'papryka'],
  'sku-poledwiczki': [
    'poledwiczki surowe worek',
    'poledwiczki surowe',
    'poledwiczki',
    'polędwiczki surowe',
  ],
  'sku-krewetki': ['pojemnik krewetek', 'krewetek', 'krewetki', 'pojemnik krewetek'],
  'sku-frytki': ['frytki'],
  'sku-jogurt': ['jogurt grecki', 'jogurt'],
  'sku-mozzarella': ['ser mozzarella', 'mozzarella', '10kg ser', 'kg ser'],
  'sku-salami': ['salami zwykle', 'salami zwykłe', 'salami'],
  'sku-sos-czosnkowy': ['sos czosnkowy', 'sos czosnek'],
  'sku-kartony-male': ['kartony male', 'kartony małe', 'kartony'],
  'sku-opak-makaron': ['opakowan na makarony', 'opakowań na makarony', 'opakowania na makarony'],
  'sku-wieczka-makaron': ['wieczka na makarony', 'wieczka makaron'],
  'sku-sztucce': ['sztucce', 'sztućce', 'lyzka i noz', 'łyżka i nóż'],
}

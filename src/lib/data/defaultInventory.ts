import type { InventoryItem } from '../../types/inventory'

export const DEFAULT_INVENTORY: InventoryItem[] = [
  // ZAMRAŻARKA
  { id: 'sku-nugetsy', name: 'Nugetsy', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-skrzydelka', name: 'Skrzydełka', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-szyszki', name: 'Szyszki', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-papryka', name: 'Papryka', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  {
    id: 'sku-poledwiczki',
    name: 'Polędwiczki surowe',
    category: 'ZAMRAŻARKA',
    unit: 'opak.',
    qty: 0,
  },
  { id: 'sku-krewetki', name: 'Krewetki', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-frytki-mrozone', name: 'Frytki', category: 'ZAMRAŻARKA', unit: 'kg.', qty: 0 },
  { id: 'sku-szynka', name: 'Szynka', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-zapiekanki', name: 'Zapiekanki', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },

  // LODÓWKA
  { id: 'sku-jogurt', name: 'Jogurt grecki', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-ser', name: 'Ser Mozzarella', category: 'LODÓWKA', unit: 'kg.', qty: 0 },
  { id: 'sku-salami', name: 'Salami', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-salami-pik', name: 'Salami pikantne', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-rwana', name: 'Rwana wieprzowina', category: 'LODÓWKA', unit: 'kg.', qty: 0 },
  { id: 'sku-pekinska', name: 'Pekińska kapusta', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-salata', name: 'Lodowa sałata', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-sos', name: 'Sos czosnkowy', category: 'LODÓWKA', unit: 'szt.', qty: 0 },

  // OPAKOWANIA
  { id: 'sku-kartony-male', name: 'Kartony małe', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-kartony-duze', name: 'Kartony duże', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-kartony-pizza', name: 'Kartony pizzerinki', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-kartony-zap', name: 'Kartony zapiekanki', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-frytki-male', name: 'Frytki małe', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-frytki-duze', name: 'Frytki duże', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  {
    id: 'sku-opak-makaron',
    name: 'Opakowania na makarony',
    category: 'OPAKOWANIA',
    unit: 'opak.',
    qty: 0,
  },
  {
    id: 'sku-wieczka',
    name: 'Wieczka na makarony',
    category: 'OPAKOWANIA',
    unit: 'opak.',
    qty: 0,
  },
  { id: 'sku-serwetki', name: 'Serwetki', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-sztucce', name: 'Sztućce (łyżka i nóż)', category: 'OPAKOWANIA', unit: 'szt.', qty: 0 },
]

export const STORAGE_KEY = 'magazyn_inventory_v4'

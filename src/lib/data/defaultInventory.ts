import type { InventoryItem } from '../../types/inventory'

export const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'sku-nugetsy', name: 'Nugetsy', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-skrzydelka', name: 'Skrzydełka', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-szyszki', name: 'Szyszki', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-papryka', name: 'Papryka', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-poledwiczki', name: 'Polędwiczki surowe', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-krewetki', name: 'Krewetki', category: 'ZAMRAŻARKA', unit: 'opak.', qty: 0 },
  { id: 'sku-frytki', name: 'Frytki', category: 'ZAMRAŻARKA', unit: 'kg.', qty: 0 },
  { id: 'sku-jogurt', name: 'Jogurt grecki', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-ser', name: 'Ser Mozzarella', category: 'LODÓWKA', unit: 'kg.', qty: 0 },
  { id: 'sku-salami', name: 'Salami', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-sos', name: 'Sos czosnkowy', category: 'LODÓWKA', unit: 'szt.', qty: 0 },
  { id: 'sku-kartony', name: 'Kartony małe', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-opak-makaron', name: 'Opakowania na makarony', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-wieczka', name: 'Wieczka na makarony', category: 'OPAKOWANIA', unit: 'opak.', qty: 0 },
  { id: 'sku-sztucce', name: 'Sztućce (łyżka i nóż)', category: 'OPAKOWANIA', unit: 'szt.', qty: 0 },
]

export const STORAGE_KEY = 'magazyn_inventory_v3'

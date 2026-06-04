export const CATEGORIES = ['LODÓWKA', 'ZAMRAŻARKA', 'OPAKOWANIA'] as const
export type Category = (typeof CATEGORIES)[number]

export const STANDARD_UOMS = ['kg.', 'szt.', 'opak.'] as const
export type StandardUom = (typeof STANDARD_UOMS)[number]

export interface InventoryItem {
  id: string
  name: string
  category: Category
  uom: StandardUom
  qty: number
}

export interface AliasEntry {
  skuId: string
  phrases: string[]
}

export interface ParseLogEntry {
  type: 'meta' | 'category' | 'success' | 'warning'
  message: string
}

export interface ParsedLineSuccess {
  kind: 'matched'
  skuId: string
  skuName: string
  qty: number
  uom: StandardUom
  category: Category
  zoneCategory: Category | null
  rawLine: string
}

export interface ParsedLineQuarantine {
  kind: 'quarantine'
  rawName: string
  qty: number
  uom: StandardUom
  suggestedCategory: Category
  rawLine: string
}

export type ParsedLineResult = ParsedLineSuccess | ParsedLineQuarantine

export interface ParseResult {
  updates: ParsedLineSuccess[]
  quarantine: ParsedLineQuarantine[]
  logs: ParseLogEntry[]
}

export interface QuarantineResolution {
  quarantineId: string
  skuId: string
  rememberAlias?: boolean
}

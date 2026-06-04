export type Category = string

export const STANDARD_UOMS = ['kg.', 'szt.', 'opak.'] as const

export type StandardUOM = (typeof STANDARD_UOMS)[number]

export interface InventoryItem {
  id: string
  name: string
  category: Category
  unit: StandardUOM
  qty: number
}

export interface QuarantineItem {
  id: string
  rawLine: string
  rawName: string
  qty: number
  unit: StandardUOM
  suggestedCategory: Category
  suggestedSkuId?: string
}

export type ParseLogType = 'meta' | 'category' | 'success' | 'warning' | 'error'

export interface ParseLogEntry {
  id: string
  type: ParseLogType
  message: string
}

export interface ParseResult {
  updates: Map<string, number>
  quarantine: QuarantineItem[]
  logs: ParseLogEntry[]
}

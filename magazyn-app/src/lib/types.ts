export const CATEGORIES = ['LODÓWKA', 'ZAMRAŻARKA', 'OPAKOWANIA'] as const
export type Category = (typeof CATEGORIES)[number]

export const STANDARD_UNITS = ['kg.', 'szt.', 'opak.'] as const
export type StandardUnit = (typeof STANDARD_UNITS)[number]

export interface InventoryItem {
  id: string
  name: string
  category: Category
  unit: StandardUnit
  qty: number
}

export type ParseLogType = 'skip' | 'category' | 'success' | 'warning'

export interface ParseLogEntry {
  type: ParseLogType
  message: string
}

export interface QuarantineItem {
  id: string
  rawLine: string
  rawName: string
  qty: number
  unit: StandardUnit
  suggestedCategory: Category
  suggestedName?: string
}

export interface ParseResult {
  logs: ParseLogEntry[]
  quarantine: QuarantineItem[]
  updatedIds: string[]
}

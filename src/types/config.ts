import type { StandardUOM } from './inventory'

export interface CategoryTheme {
  label: string
  accent: string
  border: string
  bg: string
  icon: string
}

export interface CategoryConfig {
  id: string
  name: string
  aliases: string[]
  theme: CategoryTheme
}

export interface AppConfig {
  version: 1
  categories: CategoryConfig[]
  ignoreLineKeywords: string[]
  /** canonical SKU name → list of aliases */
  skuAliases: Record<string, string[]>
  standardUoms: StandardUOM[]
  /** raw token from Messenger → standard UOM */
  uomMappings: Record<string, StandardUOM>
  /** tokens stripped from product names & used in regex */
  rawUnitTokens: string[]
  /** units that may be part of product name, not qty unit */
  unitAsProductName: string[]
  fuzzyMatchEnabled: boolean
  fuzzyMatchMaxDistance: number
}

export interface ParserConfig {
  categoryAliases: Record<string, string[]>
  ignoreLineKeywords: string[]
  skuAliases: Record<string, string[]>
  uomMappings: Record<string, StandardUOM>
  rawUnitTokens: string[]
  unitAsProductName: string[]
  defaultCategory: string
  fuzzyMatchEnabled: boolean
  fuzzyMatchMaxDistance: number
}

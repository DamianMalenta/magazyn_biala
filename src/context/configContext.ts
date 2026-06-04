import { createContext } from 'react'
import type { AppConfig, CategoryConfig } from '../types/config'
import type { StandardUOM } from '../types/inventory'
import type { buildParserConfig } from '../lib/data/defaultConfig'

export interface ConfigContextValue {
  config: AppConfig
  parserConfig: ReturnType<typeof buildParserConfig>
  categoryNames: string[]
  updateConfig: (updater: (prev: AppConfig) => AppConfig) => void
  resetConfig: () => void
  importConfig: (json: string) => void
  exportConfig: () => string
  addCategory: (payload: Omit<CategoryConfig, 'id'>) => void
  updateCategory: (id: string, patch: Partial<CategoryConfig>) => void
  removeCategory: (id: string) => boolean
  setSkuAliases: (skuName: string, aliases: string[]) => void
  renameSkuAliases: (oldName: string, newName: string) => void
  removeSkuAliases: (skuName: string) => void
  addAliasToSku: (skuName: string, alias: string) => void
  removeAliasFromSku: (skuName: string, alias: string) => void
  setIgnoreKeywords: (keywords: string[]) => void
  addIgnoreKeyword: (keyword: string) => void
  removeIgnoreKeyword: (keyword: string) => void
  setUomMapping: (raw: string, standard: StandardUOM) => void
  removeUomMapping: (raw: string) => void
  setRawUnitTokens: (tokens: string[]) => void
  addRawUnitToken: (token: string) => void
  removeRawUnitToken: (token: string) => void
  setUnitAsProductName: (tokens: string[]) => void
  setFuzzyMatch: (enabled: boolean, maxDistance?: number) => void
}

export const ConfigContext = createContext<ConfigContextValue | null>(null)

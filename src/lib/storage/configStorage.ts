import type { AppConfig } from '../../types/config'
import { CONFIG_STORAGE_KEY, DEFAULT_APP_CONFIG } from '../data/defaultConfig'

function mergeConfig(raw: Partial<AppConfig>): AppConfig {
  return {
    ...DEFAULT_APP_CONFIG,
    ...raw,
    categories: raw.categories?.length ? raw.categories : DEFAULT_APP_CONFIG.categories,
    ignoreLineKeywords: raw.ignoreLineKeywords ?? DEFAULT_APP_CONFIG.ignoreLineKeywords,
    skuAliases: raw.skuAliases ?? DEFAULT_APP_CONFIG.skuAliases,
    standardUoms: raw.standardUoms ?? DEFAULT_APP_CONFIG.standardUoms,
    uomMappings: { ...DEFAULT_APP_CONFIG.uomMappings, ...raw.uomMappings },
    rawUnitTokens: raw.rawUnitTokens?.length ? raw.rawUnitTokens : DEFAULT_APP_CONFIG.rawUnitTokens,
    unitAsProductName: raw.unitAsProductName ?? DEFAULT_APP_CONFIG.unitAsProductName,
    fuzzyMatchEnabled: raw.fuzzyMatchEnabled ?? DEFAULT_APP_CONFIG.fuzzyMatchEnabled,
    fuzzyMatchMaxDistance: raw.fuzzyMatchMaxDistance ?? DEFAULT_APP_CONFIG.fuzzyMatchMaxDistance,
    version: 1,
  }
}

export function loadConfig(): AppConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (!stored) return structuredClone(DEFAULT_APP_CONFIG)
    return mergeConfig(JSON.parse(stored) as Partial<AppConfig>)
  } catch {
    return structuredClone(DEFAULT_APP_CONFIG)
  }
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
}

export function resetConfig(): AppConfig {
  localStorage.removeItem(CONFIG_STORAGE_KEY)
  return structuredClone(DEFAULT_APP_CONFIG)
}

export function exportConfigJson(config: AppConfig): string {
  return JSON.stringify(config, null, 2)
}

export function importConfigJson(json: string): AppConfig {
  const parsed = JSON.parse(json) as Partial<AppConfig>
  if (!parsed.categories || !Array.isArray(parsed.categories)) {
    throw new Error('Nieprawidłowy plik konfiguracji: brak kategorii')
  }
  return mergeConfig(parsed)
}

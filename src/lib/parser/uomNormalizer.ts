import type { StandardUOM } from '../../types/inventory'
import type { ParserConfig } from '../../types/config'

export function normalizeUOM(
  rawUnit: string | undefined | null,
  config: ParserConfig,
): StandardUOM {
  if (!rawUnit) return 'szt.'
  const key = rawUnit.toLowerCase().trim()
  return config.uomMappings[key] ?? 'szt.'
}

export function isRawUnitToken(token: string, config: ParserConfig): boolean {
  const normalized = token.toLowerCase()
  return config.rawUnitTokens.some((u) => u.toLowerCase() === normalized)
}

export function stripUnitTokensFromName(name: string, config: ParserConfig): string {
  let cleaned = name.trim()
  for (const token of config.rawUnitTokens) {
    const pattern = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    cleaned = cleaned.replace(pattern, ' ')
  }
  return cleaned.replace(/\s+/g, ' ').trim()
}

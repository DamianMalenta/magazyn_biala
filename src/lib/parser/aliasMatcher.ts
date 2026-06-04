import type { InventoryItem } from '../../types/inventory'
import { SKU_ALIASES } from '../data/dictionary'
import { normalizeText } from '../utils/text'

export interface AliasEntry {
  canonical: string
  alias: string
  aliasNorm: string
}

const STATIC_ALIASES: AliasEntry[] = Object.entries(SKU_ALIASES).flatMap(([canonical, aliases]) =>
  aliases.map((alias) => ({
    canonical,
    alias,
    aliasNorm: normalizeText(alias),
  })),
)

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i])
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[b.length][a.length]
}

function normalizeForMatch(value: string): string {
  return normalizeText(value).replace(/[()[\]]/g, ' ').replace(/\s+/g, ' ').trim()
}

function includesAlias(haystack: string, aliasNorm: string): boolean {
  const normalizedHaystack = normalizeForMatch(haystack)
  if (normalizedHaystack.includes(aliasNorm)) return true

  const words = normalizedHaystack.split(' ')
  const aliasWords = aliasNorm.split(' ')

  if (aliasWords.length === 1 && aliasNorm.length >= 4) {
    return words.some((word) => {
      if (word.length < 3) return false
      return levenshtein(word, aliasNorm) <= Math.max(1, Math.floor(aliasNorm.length * 0.25))
    })
  }

  return aliasNorm.split(' ').every((part) => normalizedHaystack.includes(part))
}

export interface MatchResult {
  canonical: string
  confidence: 'exact' | 'alias' | 'fuzzy' | 'learned'
}

export function buildAliasEntries(
  inventory: InventoryItem[],
  customAliases: Record<string, string[]> = {},
): AliasEntry[] {
  const byId = new Map(inventory.map((item) => [item.id, item.name]))

  const customEntries: AliasEntry[] = []
  for (const [skuId, aliases] of Object.entries(customAliases)) {
    const canonical = byId.get(skuId)
    if (!canonical) continue
    for (const alias of aliases) {
      customEntries.push({
        canonical,
        alias,
        aliasNorm: normalizeText(alias),
      })
    }
  }

  return [...STATIC_ALIASES, ...customEntries].sort((a, b) => b.aliasNorm.length - a.aliasNorm.length)
}

export function matchSkuName(
  rawName: string,
  inventoryNames: string[],
  aliasEntries: AliasEntry[],
): MatchResult | null {
  const normalized = normalizeForMatch(rawName)
  if (!normalized) return null

  const exactInventory = inventoryNames.find((name) => normalizeForMatch(name) === normalized)
  if (exactInventory) {
    return { canonical: exactInventory, confidence: 'exact' }
  }

  const staticNorms = new Set(STATIC_ALIASES.map((e) => e.aliasNorm))

  for (const entry of aliasEntries) {
    if (includesAlias(normalized, entry.aliasNorm)) {
      const confidence: MatchResult['confidence'] = staticNorms.has(entry.aliasNorm)
        ? 'alias'
        : 'learned'
      return { canonical: entry.canonical, confidence }
    }
  }

  let best: { canonical: string; distance: number } | null = null
  for (const name of inventoryNames) {
    const nameNorm = normalizeForMatch(name)
    const distance = levenshtein(normalized, nameNorm)
    const threshold = Math.max(2, Math.floor(nameNorm.length * 0.35))
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { canonical: name, distance }
    }
  }

  if (best && best.distance <= 2) {
    return { canonical: best.canonical, confidence: 'fuzzy' }
  }

  return null
}

export function getStaticAliasEntries(): AliasEntry[] {
  return STATIC_ALIASES
}

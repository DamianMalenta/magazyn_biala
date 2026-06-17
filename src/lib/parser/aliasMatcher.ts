import type { Category, InventoryItem } from '../../types/inventory'
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

/** Krótkie aliasy dopasowujemy tylko jako całe wyrażenie (np. „salami”, nie „salami picante”). */
const EXACT_ONLY_ALIASES = new Set(['salami', 'picante', 'pikanterii', '30 cm', '37 cm'])

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

  if (EXACT_ONLY_ALIASES.has(aliasNorm)) {
    return normalizedHaystack === aliasNorm
  }

  if (normalizedHaystack === aliasNorm) return true
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

function findAliasMatches(normalized: string, aliasEntries: AliasEntry[]): AliasEntry[] {
  return aliasEntries.filter((entry) => includesAlias(normalized, entry.aliasNorm))
}

function scoreAliasMatch(
  entry: AliasEntry,
  inventory: InventoryItem[],
  preferredCategory?: Category | null,
): number {
  const item = inventory.find((i) => i.name === entry.canonical)
  let score = entry.aliasNorm.length

  if (preferredCategory && item) {
    if (item.category === preferredCategory) {
      score += 1000
    } else {
      score -= 10_000
    }
  }

  return score
}

function pickBestAliasMatch(
  matches: AliasEntry[],
  inventory: InventoryItem[],
  preferredCategory?: Category | null,
  staticNorms?: Set<string>,
): MatchResult | null {
  if (matches.length === 0) return null

  const norms = staticNorms ?? new Set(STATIC_ALIASES.map((e) => e.aliasNorm))
  let best: { entry: AliasEntry; score: number } | null = null

  for (const entry of matches) {
    const score = scoreAliasMatch(entry, inventory, preferredCategory)
    if (!best || score > best.score) {
      best = { entry, score }
    }
  }

  if (!best) return null

  const confidence: MatchResult['confidence'] = norms.has(best.entry.aliasNorm) ? 'alias' : 'learned'
  return { canonical: best.entry.canonical, confidence }
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
  inventory: InventoryItem[],
  aliasEntries: AliasEntry[],
  preferredCategory?: Category | null,
): MatchResult | null {
  const normalized = normalizeForMatch(rawName)
  if (!normalized) return null

  const exactItem = inventory.find((item) => normalizeForMatch(item.name) === normalized)
  if (exactItem) {
    const zoneOk = !preferredCategory || exactItem.category === preferredCategory
    if (zoneOk) {
      return { canonical: exactItem.name, confidence: 'exact' }
    }
  }

  const staticNorms = new Set(STATIC_ALIASES.map((e) => e.aliasNorm))
  const aliasMatches = findAliasMatches(normalized, aliasEntries)
  const aliasResult = pickBestAliasMatch(aliasMatches, inventory, preferredCategory, staticNorms)
  if (aliasResult) return aliasResult

  if (exactItem) {
    return { canonical: exactItem.name, confidence: 'exact' }
  }

  let best: { canonical: string; distance: number; category?: Category } | null = null
  for (const item of inventory) {
    const nameNorm = normalizeForMatch(item.name)
    const distance = levenshtein(normalized, nameNorm)
    const threshold = Math.max(2, Math.floor(nameNorm.length * 0.35))
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { canonical: item.name, distance, category: item.category }
    }
  }

  if (best && best.distance <= 2) {
    if (
      preferredCategory &&
      best.category &&
      best.category !== preferredCategory
    ) {
      const inZone = inventory.find(
        (item) =>
          item.category === preferredCategory &&
          levenshtein(normalized, normalizeForMatch(item.name)) <= 2,
      )
      if (inZone) {
        return { canonical: inZone.name, confidence: 'fuzzy' }
      }
    }
    return { canonical: best.canonical, confidence: 'fuzzy' }
  }

  return null
}

export function getStaticAliasEntries(): AliasEntry[] {
  return STATIC_ALIASES
}

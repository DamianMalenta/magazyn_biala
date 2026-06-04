import type { InventoryItem } from '@/types/inventory'
import { normalizePolish } from '@/lib/utils'

export interface AliasIndexEntry {
  skuId: string
  phrase: string
  normalized: string
}

export function buildAliasIndex(
  items: InventoryItem[],
  customAliases: Record<string, string[]>,
): AliasIndexEntry[] {
  const entries: AliasIndexEntry[] = []

  for (const item of items) {
    const phrases = new Set<string>([
      item.name,
      ...(customAliases[item.id] ?? []),
    ])
    for (const phrase of phrases) {
      const normalized = normalizePolish(phrase)
      if (normalized) {
        entries.push({ skuId: item.id, phrase, normalized })
      }
    }
  }

  return entries.sort((a, b) => b.normalized.length - a.normalized.length)
}

export interface MatchResult {
  skuId: string
  matchedPhrase: string
  score: number
}

export function matchProductToSku(
  productName: string,
  index: AliasIndexEntry[],
): MatchResult | null {
  const normalized = normalizePolish(productName)
  if (!normalized) return null

  for (const entry of index) {
    if (normalized === entry.normalized) {
      return { skuId: entry.skuId, matchedPhrase: entry.phrase, score: 100 }
    }
    if (
      normalized.includes(entry.normalized) ||
      entry.normalized.includes(normalized)
    ) {
      const score =
        (Math.min(normalized.length, entry.normalized.length) /
          Math.max(normalized.length, entry.normalized.length)) *
        100
      if (score >= 55) {
        return { skuId: entry.skuId, matchedPhrase: entry.phrase, score }
      }
    }
  }

  return null
}

import type { Category } from '../../types/inventory'
import { CATEGORY_ALIASES, IGNORE_LINE_KEYWORDS } from '../data/dictionary'
import { normalizeText } from '../utils/text'

export type LineKind = 'ignore' | 'category' | 'item'

export interface LineClassification {
  kind: LineKind
  category?: Category
}

const QUANTITY_PREFIX = /^\d/

const META_PATTERNS = [
  /^magazyn\b/i,
  /\baktualizacja\b/i,
  /\bostatnia\b/i,
  /\binwentaryzacja\b/i,
  /^\d{1,2}[./]\d{1,2}/,
  /\b\d{1,2}:\d{2}\b/,
]

const ITEM_HINTS = [
  'worek',
  'pojemnik',
  'pojemniki',
  'nugetsy',
  'nuggets',
  'mozzarella',
  'salami',
  'frytki',
  'krewetki',
  'poledwiczki',
  'polędwiczki',
  'jogurt',
  'czosnkowy',
  'wieczka',
  'sztucce',
  'sztućce',
  'kartony małe',
  'kartony male',
  'na makarony',
  'papryka',
  'skrzyd',
  'szyszk',
]

export function isMetaLine(line: string): boolean {
  const normalized = normalizeText(line)
  if (IGNORE_LINE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return true
  }
  return META_PATTERNS.some((pattern) => pattern.test(line))
}

export function looksLikeInventoryItem(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (QUANTITY_PREFIX.test(trimmed)) return true

  const normalized = normalizeText(trimmed)
  return ITEM_HINTS.some((hint) => normalized.includes(hint))
}

export function classifyLine(line: string): LineClassification {
  const trimmed = line.trim()
  if (!trimmed) return { kind: 'ignore' }

  if (isMetaLine(trimmed)) {
    return { kind: 'ignore' }
  }

  const normalized = normalizeText(trimmed)

  if (!QUANTITY_PREFIX.test(trimmed) && !looksLikeInventoryItem(trimmed)) {
    for (const [category, aliases] of Object.entries(CATEGORY_ALIASES) as [Category, string[]][]) {
      const isHeader = aliases.some((alias) => {
        const aliasNorm = normalizeText(alias)
        return normalized === aliasNorm || normalized.startsWith(`${aliasNorm} `)
      })

      if (isHeader && normalized.split(' ').length <= 3) {
        return { kind: 'category', category }
      }
    }
  }

  return { kind: 'item' }
}

export class CategoryStateMachine {
  private current: Category | null = null
  private readonly touched = new Set<Category>()

  get zone(): Category | null {
    return this.current
  }

  /** Strefy wymienione nagłówkiem w wiadomości (cała strefa podlega aktualizacji). */
  getTouchedCategories(): ReadonlySet<Category> {
    return this.touched
  }

  processClassification(classification: LineClassification): Category | null {
    if (classification.kind === 'category' && classification.category) {
      this.current = classification.category
      this.touched.add(classification.category)
      return this.current
    }
    return null
  }

  suggestCategory(): Category {
    return this.current ?? 'OPAKOWANIA'
  }
}

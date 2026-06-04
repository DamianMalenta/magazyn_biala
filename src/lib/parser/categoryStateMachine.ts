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
  /^renament\b/i,
]

/** Usuwa datę z nagłówka strefy: „Lodówka 04.06”, „Zamrazalka — 04.06.2026”. */
export function stripDateFromHeader(line: string): string {
  return line
    .replace(/\s*[-–—]\s*\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?\s*$/i, '')
    .replace(/\s+\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?\s*$/i, '')
    .trim()
}

function isDateOnlySuffix(rest: string): boolean {
  const compact = rest.replace(/\s/g, '')
  return (
    /^\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?$/.test(compact) ||
    /^\d{1,2}\.\d{1,2}$/.test(compact)
  )
}

/** Nagłówek strefy (lodówka 04.06, zamrazalka, opakowania). */
export function detectCategoryHeader(line: string): Category | null {
  const stripped = stripDateFromHeader(line.trim())
  const normalized = normalizeText(stripped)

  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES) as [Category, string[]][]) {
    for (const alias of aliases) {
      const aliasNorm = normalizeText(alias)
      if (normalized === aliasNorm) return category

      if (normalized.startsWith(`${aliasNorm} `)) {
        const rest = normalized.slice(aliasNorm.length).trim()
        if (!rest || isDateOnlySuffix(rest)) return category
      }
    }
  }

  return null
}

export function isMetaLine(line: string): boolean {
  const normalized = normalizeText(line)
  if (IGNORE_LINE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return true
  }
  if (/^renament\b/i.test(normalized)) return false
  return META_PATTERNS.some((pattern) => pattern.test(line))
}

export function classifyLine(line: string): LineClassification {
  const trimmed = line.trim()
  if (!trimmed) return { kind: 'ignore' }

  if (isMetaLine(trimmed)) {
    return { kind: 'ignore' }
  }

  if (!QUANTITY_PREFIX.test(trimmed)) {
    const category = detectCategoryHeader(trimmed)
    if (category) {
      return { kind: 'category', category }
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

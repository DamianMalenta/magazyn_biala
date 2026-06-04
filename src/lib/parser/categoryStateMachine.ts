import type { Category } from '../../types/inventory'
import { CATEGORY_ALIASES, IGNORE_LINE_KEYWORDS } from '../data/dictionary'
import { normalizeText } from '../utils/text'

export type LineKind = 'ignore' | 'category' | 'item'

export interface LineClassification {
  kind: LineKind
  category?: Category
}

const QUANTITY_PREFIX = /^\d/

export function classifyLine(line: string): LineClassification {
  const trimmed = line.trim()
  if (!trimmed) return { kind: 'ignore' }

  const normalized = normalizeText(trimmed)

  if (IGNORE_LINE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { kind: 'ignore' }
  }

  if (!QUANTITY_PREFIX.test(trimmed)) {
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

  get zone(): Category | null {
    return this.current
  }

  processClassification(classification: LineClassification): Category | null {
    if (classification.kind === 'category' && classification.category) {
      this.current = classification.category
      return this.current
    }
    return null
  }

  suggestCategory(): Category {
    return this.current ?? 'OPAKOWANIA'
  }
}

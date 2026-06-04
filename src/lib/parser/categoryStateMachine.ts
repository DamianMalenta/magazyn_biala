import type { ParserConfig } from '../../types/config'
import { normalizeText } from '../utils/text'

export type LineKind = 'ignore' | 'category' | 'item'

export interface LineClassification {
  kind: LineKind
  category?: string
}

const QUANTITY_PREFIX = /^\d/

export function classifyLine(line: string, config: ParserConfig): LineClassification {
  const trimmed = line.trim()
  if (!trimmed) return { kind: 'ignore' }

  const normalized = normalizeText(trimmed)

  if (config.ignoreLineKeywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return { kind: 'ignore' }
  }

  if (!QUANTITY_PREFIX.test(trimmed)) {
    for (const [category, aliases] of Object.entries(config.categoryAliases)) {
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
  private current: string | null = null
  private readonly config: ParserConfig

  constructor(config: ParserConfig) {
    this.config = config
  }

  get zone(): string | null {
    return this.current
  }

  processClassification(classification: LineClassification): string | null {
    if (classification.kind === 'category' && classification.category) {
      this.current = classification.category
      return this.current
    }
    return null
  }

  suggestCategory(): string {
    return this.current ?? this.config.defaultCategory
  }
}

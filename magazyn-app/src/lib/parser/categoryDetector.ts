import { CATEGORY_ALIASES } from '../dictionary'
import type { Category } from '../types'
import { normalizeText } from '../normalize'
import type { ParsedLine } from './lineParser'

export function detectCategoryHeader(
  line: string,
  parsed: ParsedLine
): Category | null {
  // Lines with explicit quantity are products, not zone headers
  if (parsed.hadExplicitQty) return null

  const norm = normalizeText(line)
  if (!norm) return null

  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES) as [
    Category,
    string[],
  ][]) {
    const hit = aliases.some((alias) => {
      const a = normalizeText(alias)
      return norm === a || norm.startsWith(a + ' ') || norm.endsWith(' ' + a)
    })
    if (hit) return category
  }

  return null
}

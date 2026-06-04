import type { Category } from '@/types/inventory'
import { normalizePolish } from '@/lib/utils'

/** Category header aliases — longest first to avoid partial matches */
export const CATEGORY_ALIASES: Record<Category, string[]> = {
  LODÓWKA: ['lodowka', 'lodówka', 'chlodnia', 'chłodnia'],
  ZAMRAŻARKA: ['zamrazalnik', 'zamrażalnik', 'zamrazarka', 'zamrażarka', 'mrozarka', 'mrożarka'],
  OPAKOWANIA: ['opakowania', 'opakowanie'],
}

const FLAT_CATEGORIES = (
  Object.entries(CATEGORY_ALIASES) as [Category, string[]][]
)
  .flatMap(([category, aliases]) =>
    aliases.map((alias) => ({ category, alias: normalizePolish(alias) })),
  )
  .sort((a, b) => b.alias.length - a.alias.length)

export function detectCategoryHeader(line: string): Category | null {
  const normalized = normalizePolish(line)
  if (!normalized) return null

  for (const { category, alias } of FLAT_CATEGORIES) {
    if (normalized === alias) return category
  }
  return null
}

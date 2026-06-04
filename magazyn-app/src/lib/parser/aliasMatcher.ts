import { SORTED_ALIASES } from '../dictionary'
import { normalizeText, stripPunctuation } from '../normalize'

export function resolveCanonicalName(rawName: string): string {
  const norm = normalizeText(stripPunctuation(rawName))
  if (!norm) return rawName.trim()

  for (const { canonical, aliasNorm } of SORTED_ALIASES) {
    if (norm.includes(normalizeText(aliasNorm))) {
      return canonical
    }
  }

  return rawName.trim()
}

export function findInventoryMatch(
  inventoryNames: { id: string; name: string }[],
  canonicalName: string,
  rawName: string
): { id: string; name: string } | undefined {
  const canonNorm = normalizeText(canonicalName)
  const rawNorm = normalizeText(rawName)

  return inventoryNames.find((item) => {
    const n = normalizeText(item.name)
    return n === canonNorm || n === rawNorm
  })
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildTrailingUnitPattern(tokens: string[]): RegExp {
  const sorted = [...tokens].sort((a, b) => b.length - a.length).map(escapeRegex)
  return new RegExp(`\\b(${sorted.join('|')})\\s*$`, 'i')
}

export function buildLeadingQtyPattern(tokens: string[]): RegExp {
  const sorted = [...tokens].sort((a, b) => b.length - a.length).map(escapeRegex)
  const unitPart = sorted.length > 0 ? sorted.join('|') : 'x|kg|szt'
  return new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${unitPart})?\\s*(.*)$`, 'i')
}

export function buildUnitAsProductPattern(tokens: string[]): RegExp {
  const sorted = [...tokens].sort((a, b) => b.length - a.length).map(escapeRegex)
  return new RegExp(`^(${sorted.join('|')})$`, 'i')
}

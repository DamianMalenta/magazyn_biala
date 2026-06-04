/** Lowercase + strip Polish diacritics for fuzzy matching */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim()
}

export function stripPunctuation(input: string): string {
  return input.replace(/[()[\].,;:!?]/g, ' ').replace(/\s+/g, ' ').trim()
}

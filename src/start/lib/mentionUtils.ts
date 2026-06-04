import type { Employee } from '../types'

export type MentionPart = { type: 'text' | 'mention'; value: string }

export function extractMentions(text: string, employees: Employee[]): string[] {
  const names = employees.map((e) => e.name)
  const found = new Set<string>()
  const re = /@([\p{L}\p{N}][\p{L}\p{N}\s.-]{0,40})/gu
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const raw = m[1].trim()
    for (const name of names) {
      if (raw.toLowerCase().startsWith(name.toLowerCase())) {
        found.add(name)
        break
      }
    }
  }
  return [...found]
}

/** @deprecated alias — używaj extractMentions */
export const parseMentions = extractMentions

export function getMentionQuery(text: string, cursor: number): { query: string; atIndex: number } | null {
  const before = text.slice(0, cursor)
  const match = before.match(/@([\p{L}\p{N}\s.-]*)$/u)
  if (!match) return null
  return { query: match[1], atIndex: cursor - match[0].length }
}

export function filterEmployeesForMention(employees: Employee[], query: string): Employee[] {
  const q = query.trim().toLowerCase()
  if (!q) return employees.slice(0, 8)
  return employees.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8)
}

export function insertMention(
  text: string,
  atIndex: number,
  query: string,
  name: string,
): { text: string; cursor: number } {
  const end = atIndex + 1 + query.length
  const next = `${text.slice(0, atIndex)}@${name} ${text.slice(end)}`
  return { text: next, cursor: atIndex + name.length + 2 }
}

export function splitMentionParts(content: string): MentionPart[] {
  const parts: MentionPart[] = []
  const re = /@([\p{L}\p{N}][\p{L}\p{N}\s.-]{0,40})/gu
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, m.index) })
    }
    parts.push({ type: 'mention', value: m[0] })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }
  return parts.length ? parts : [{ type: 'text', value: content }]
}

export function getMentionedEmployees(mentions: string[], employees: Employee[]): Employee[] {
  const set = new Set(mentions)
  return employees.filter((e) => set.has(e.name))
}

import type { DayKey } from '../types'
import { DAY_INDEX_TO_KEY } from './scheduleUtils'

const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

/** Klucz tygodnia = data poniedziałku (YYYY-MM-DD), strefa lokalna. */
export function getWeekKey(date = new Date()): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return formatDateKey(d)
}

export function getMonday(weekKey: string): Date {
  return parseDateKey(weekKey)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  next.setHours(0, 0, 0, 0)
  return next
}

export function addWeeks(weekKey: string, weeks: number): string {
  const monday = getMonday(weekKey)
  return formatDateKey(addDays(monday, weeks * 7))
}

export function isCurrentWeek(weekKey: string, now = new Date()): boolean {
  return weekKey === getWeekKey(now)
}

/** Zwraca dzień tygodnia grafiku, jeśli `date` wpada w dany tydzień. */
export function getDayKeyInWeek(weekKey: string, date = new Date()): DayKey | null {
  if (getWeekKey(date) !== weekKey) return null
  return DAY_INDEX_TO_KEY[date.getDay()]
}

export function formatWeekLabel(weekKey: string): string {
  const monday = getMonday(weekKey)
  const sunday = addDays(monday, 6)
  const monM = monday.getMonth()
  const sunM = sunday.getMonth()
  const year = sunday.getFullYear()

  if (monM === sunM) {
    return `${monday.getDate()}–${sunday.getDate()} ${MONTHS_SHORT[monM]} ${year}`
  }
  return `${monday.getDate()} ${MONTHS_SHORT[monM]} – ${sunday.getDate()} ${MONTHS_SHORT[sunM]} ${year}`
}

export function formatWeekLabelLong(weekKey: string): string {
  const monday = getMonday(weekKey)
  const sunday = addDays(monday, 6)
  return `Pon ${formatDateKey(monday)} – Nd ${formatDateKey(sunday)}`
}

export function listWeekKeys(anchorWeekKey = getWeekKey(), pastWeeks = 12, futureWeeks = 24): string[] {
  const keys: string[] = []
  for (let offset = -pastWeeks; offset <= futureWeeks; offset++) {
    keys.push(addWeeks(anchorWeekKey, offset))
  }
  return keys
}

export function compareWeekKeys(a: string, b: string): number {
  return a.localeCompare(b)
}

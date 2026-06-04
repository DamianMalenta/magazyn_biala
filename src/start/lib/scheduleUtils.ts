import { DAY_KEYS, type DayKey, type Employee, type ShiftEntry, type WeekSchedule } from '../types'

const DAY_INDEX_TO_KEY: DayKey[] = ['nd', 'pon', 'wt', 'sr', 'czw', 'pt', 'sob']

export function getTodayKey(): DayKey {
  return DAY_INDEX_TO_KEY[new Date().getDay()]
}

export function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function isShiftActive(shift: ShiftEntry, now = new Date()): boolean {
  const current = now.getHours() * 60 + now.getMinutes()
  const start = parseTime(shift.start)
  const end = parseTime(shift.end)
  if (end <= start) return current >= start || current < end
  return current >= start && current < end
}

export function getActiveShifts(schedule: WeekSchedule, day: DayKey = getTodayKey()): ShiftEntry[] {
  const shifts = schedule[day] ?? []
  return shifts.filter((s) => isShiftActive(s))
}

export function getEmployeeMap(employees: Employee[]): Map<string, Employee> {
  return new Map(employees.map((e) => [e.id, e]))
}

export function formatShiftTime(shift: ShiftEntry): string {
  return `${shift.start}–${shift.end}`
}

export function getGreeting(now = new Date()): string {
  const h = now.getHours()
  if (h < 6) return 'Dobry wieczór'
  if (h < 12) return 'Dzień dobry'
  if (h < 18) return 'Dzień dobry'
  if (h < 22) return 'Dobry wieczór'
  return 'Dobry wieczór'
}

export function getWeekProgress(): { dayIndex: number; label: string } {
  const today = getTodayKey()
  const dayIndex = DAY_KEYS.indexOf(today)
  return { dayIndex, label: today }
}

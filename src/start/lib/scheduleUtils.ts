import { DAY_KEYS, type DayKey, type Employee, type ScheduleByWeek, type ShiftEntry, type WeekSchedule } from '../types'
import { clearEmployeeRow, formatShiftShort } from './shiftPresets'
import { getWeekKey } from './weekCalendar'

export const DAY_INDEX_TO_KEY: DayKey[] = ['nd', 'pon', 'wt', 'sr', 'czw', 'pt', 'sob']

export function emptyWeekSchedule(): WeekSchedule {
  return { pon: [], wt: [], sr: [], czw: [], pt: [], sob: [], nd: [] }
}

export function getWeekSchedule(schedules: ScheduleByWeek, weekKey: string): WeekSchedule {
  return schedules[weekKey] ?? emptyWeekSchedule()
}

export function getCurrentWeekSchedule(schedules: ScheduleByWeek, now = new Date()): WeekSchedule {
  return getWeekSchedule(schedules, getWeekKey(now))
}

export function setWeekSchedule(schedules: ScheduleByWeek, weekKey: string, week: WeekSchedule): ScheduleByWeek {
  return { ...schedules, [weekKey]: week }
}

export function copyWeekSchedule(schedules: ScheduleByWeek, fromWeekKey: string, toWeekKey: string): ScheduleByWeek {
  const source = getWeekSchedule(schedules, fromWeekKey)
  return setWeekSchedule(schedules, toWeekKey, structuredClone(source))
}

export function clearEmployeeFromAllSchedules(schedules: ScheduleByWeek, employeeId: string): ScheduleByWeek {
  const next: ScheduleByWeek = {}
  for (const [weekKey, week] of Object.entries(schedules)) {
    next[weekKey] = clearEmployeeRow(week, employeeId)
  }
  return next
}

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
  return formatShiftShort(shift)
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

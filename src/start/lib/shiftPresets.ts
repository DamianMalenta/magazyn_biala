import type { DayKey, ShiftEntry, WeekSchedule } from '../types'
import { DAY_KEYS } from '../types'

export interface ShiftPreset {
  id: string
  label: string
  short: string
  start: string
  end: string
}

export const SHIFT_PRESETS: ShiftPreset[] = [
  { id: 'rano', label: 'Rano 7–15', short: '7–15', start: '07:00', end: '15:00' },
  { id: 'standard', label: 'Standard 8–16', short: '8–16', start: '08:00', end: '16:00' },
  { id: 'sala', label: 'Sala 10–18', short: '10–18', start: '10:00', end: '18:00' },
  { id: 'bar', label: 'Bar 12–20', short: '12–20', start: '12:00', end: '20:00' },
  { id: 'wieczor', label: 'Wieczór 14–22', short: '14–22', start: '14:00', end: '22:00' },
  { id: 'dlugi', label: 'Długa 10–22', short: '10–22', start: '10:00', end: '22:00' },
]

export function padTime(time: string): string {
  const [h, m] = time.split(':')
  return `${h.padStart(2, '0')}:${m}`
}

export function parseShiftInput(value: string): { start: string; end: string; note?: string } | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '-') return null
  const match = trimmed.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s+(.*))?$/)
  if (!match) return null
  const [, start, end, note] = match
  return { start: padTime(start), end: padTime(end), note: note?.trim() }
}

export function getShiftForCell(schedule: WeekSchedule, day: DayKey, employeeId: string): ShiftEntry | undefined {
  return schedule[day]?.find((s) => s.employeeId === employeeId)
}

export function setShiftForCell(
  schedule: WeekSchedule,
  day: DayKey,
  employeeId: string,
  shift: { start: string; end: string; note?: string } | null,
): WeekSchedule {
  const next = { ...schedule }
  const others = (next[day] ?? []).filter((s) => s.employeeId !== employeeId)
  next[day] = shift ? [...others, { employeeId, ...shift }] : others
  return next
}

export function applyPresetToCell(
  schedule: WeekSchedule,
  day: DayKey,
  employeeId: string,
  preset: ShiftPreset,
): WeekSchedule {
  return setShiftForCell(schedule, day, employeeId, { start: preset.start, end: preset.end })
}

export function clearEmployeeRow(schedule: WeekSchedule, employeeId: string): WeekSchedule {
  const next = { ...schedule }
  for (const day of DAY_KEYS) {
    next[day] = (next[day] ?? []).filter((s) => s.employeeId !== employeeId)
  }
  return next
}

/** Kopiuje grafik z `fromDay` na wszystkie dni tygodnia dla danej osoby. */
export function copyDayToWeek(
  schedule: WeekSchedule,
  employeeId: string,
  fromDay: DayKey,
): WeekSchedule {
  const source = getShiftForCell(schedule, fromDay, employeeId)
  let next = clearEmployeeRow(schedule, employeeId)
  if (!source) return next
  for (const day of DAY_KEYS) {
    next = setShiftForCell(next, day, employeeId, {
      start: source.start,
      end: source.end,
      note: source.note,
    })
  }
  return next
}

/** Wypełnia cały tydzień tym samym presetem dla osoby. */
export function fillWeekWithPreset(
  schedule: WeekSchedule,
  employeeId: string,
  preset: ShiftPreset,
): WeekSchedule {
  let next = clearEmployeeRow(schedule, employeeId)
  for (const day of DAY_KEYS) {
    next = applyPresetToCell(next, day, employeeId, preset)
  }
  return next
}

export function formatShiftShort(shift: ShiftEntry): string {
  const s = shift.start.replace(':00', '')
  const e = shift.end.replace(':00', '')
  return `${s}–${e}`
}

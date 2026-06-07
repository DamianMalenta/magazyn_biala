import type { DayKey, ShiftEntry, WeekSchedule } from '../types'
import { DAY_KEYS } from '../types'

export interface ShiftPreset {
  id: string
  label: string
  short: string
  start: string
  end: string
}

/** Domyślne szablony — skrót „11:22” = 11:00–22:00 */
export const DEFAULT_SHIFT_PRESETS: ShiftPreset[] = [
  { id: 'p1122', label: '11:00–22:00', short: '11:22', start: '11:00', end: '22:00' },
  { id: 'p1123', label: '11:00–23:00', short: '11:23', start: '11:00', end: '23:00' },
  { id: 'p1222', label: '12:00–22:00', short: '12:22', start: '12:00', end: '22:00' },
  { id: 'p1223', label: '12:00–23:00', short: '12:23', start: '12:00', end: '23:00' },
  { id: 'p1117', label: '11:00–17:00', short: '11:17', start: '11:00', end: '17:00' },
  { id: 'p1217', label: '12:00–17:00', short: '12:17', start: '12:00', end: '17:00' },
  { id: 'p1722', label: '17:00–22:00', short: '17:22', start: '17:00', end: '22:00' },
  { id: 'p1723', label: '17:00–23:00', short: '17:23', start: '17:00', end: '23:00' },
  { id: 'p1017', label: '10:00–17:00', short: '10:17', start: '10:00', end: '17:00' },
  { id: 'p1015', label: '10:00–15:00', short: '10:15', start: '10:00', end: '15:00' },
  { id: 'p1522', label: '15:00–22:00', short: '15:22', start: '15:00', end: '22:00' },
  { id: 'p1523', label: '15:00–23:00', short: '15:23', start: '15:00', end: '23:00' },
]

/** @deprecated Użyj DEFAULT_SHIFT_PRESETS lub config.shiftPresets */
export const SHIFT_PRESETS = DEFAULT_SHIFT_PRESETS

export function padTime(time: string): string {
  const [h, m] = time.split(':')
  return `${h.padStart(2, '0')}:${m}`
}

/** Skrót godzinowy: 11:22 → 11:00–22:00 (obie liczby to godziny 0–23). */
function parseHourShorthand(value: string): { start: string; end: string } | null {
  const match = value.match(/^(\d{1,2}):(\d{1,2})$/)
  if (!match) return null
  const startH = parseInt(match[1], 10)
  const endH = parseInt(match[2], 10)
  if (startH < 0 || startH > 23 || endH < 0 || endH > 23 || endH <= startH) return null
  return { start: padTime(`${startH}:00`), end: padTime(`${endH}:00`) }
}

export function buildPresetShort(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if (sm === 0 && em === 0) return `${sh}:${eh}`
  const s = start.replace(':00', '')
  const e = end.replace(':00', '')
  return `${s}–${e}`
}

export function normalizeShiftPreset(preset: ShiftPreset): ShiftPreset {
  const start = padTime(preset.start)
  const end = padTime(preset.end)
  return {
    ...preset,
    start,
    end,
    short: preset.short.trim() || buildPresetShort(start, end),
    label: preset.label.trim() || `${start}–${end}`,
  }
}

export function parseShiftInput(value: string): { start: string; end: string; note?: string } | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '-') return null

  const shorthand = parseHourShorthand(trimmed)
  if (shorthand) return shorthand

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
  const [sh, sm] = shift.start.split(':').map(Number)
  const [eh, em] = shift.end.split(':').map(Number)
  if (sm === 0 && em === 0) return `${sh}:${eh}`
  const s = shift.start.replace(':00', '')
  const e = shift.end.replace(':00', '')
  return `${s}–${e}`
}

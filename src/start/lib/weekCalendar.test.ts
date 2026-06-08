import { describe, expect, it } from 'vitest'
import {
  addWeeks,
  formatWeekLabel,
  getDayKeyInWeek,
  getWeekKey,
  isCurrentWeek,
} from './weekCalendar'

describe('weekCalendar', () => {
  it('uses Monday as week key', () => {
    // 2026-06-11 is Thursday
    expect(getWeekKey(new Date(2026, 5, 11))).toBe('2026-06-08')
  })

  it('adds weeks correctly', () => {
    expect(addWeeks('2026-06-08', 1)).toBe('2026-06-15')
    expect(addWeeks('2026-06-08', -1)).toBe('2026-06-01')
  })

  it('detects day inside viewed week', () => {
    expect(getDayKeyInWeek('2026-06-08', new Date(2026, 5, 11))).toBe('czw')
    expect(getDayKeyInWeek('2026-06-08', new Date(2026, 5, 15))).toBeNull()
  })

  it('formats week label in one month', () => {
    expect(formatWeekLabel('2026-06-08')).toBe('8–14 cze 2026')
  })

  it('knows current week', () => {
    expect(isCurrentWeek(getWeekKey(new Date(2026, 5, 11)), new Date(2026, 5, 11))).toBe(true)
    expect(isCurrentWeek('2020-01-06', new Date(2026, 5, 11))).toBe(false)
  })
})

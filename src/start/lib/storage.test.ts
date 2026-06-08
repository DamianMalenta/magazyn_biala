import { describe, expect, it } from 'vitest'
import { DEMO_WEEK_SCHEDULE } from './defaultConfig'
import { mergeSchedule, mergeSchedules } from './storage'
import { getWeekKey } from './weekCalendar'

describe('mergeSchedule', () => {
  it('returns empty week when nothing was saved for a day', () => {
    const merged = mergeSchedule({
      pon: [{ employeeId: 'e1', start: '11:00', end: '22:00' }],
    })

    expect(merged.pon).toHaveLength(1)
    expect(merged.wt).toEqual([])
    expect(merged.nd).toEqual([])
  })
})

describe('mergeSchedules', () => {
  it('migrates legacy single-week schedule to current week key', () => {
    const currentKey = getWeekKey()
    const merged = mergeSchedules(undefined, {
      pon: [{ employeeId: 'e1', start: '11:00', end: '22:00' }],
    })

    expect(merged[currentKey]?.pon).toEqual([{ employeeId: 'e1', start: '11:00', end: '22:00' }])
  })

  it('keeps multiple saved weeks separate', () => {
    const merged = mergeSchedules({
      '2026-06-08': {
        pon: [{ employeeId: 'e1', start: '11:00', end: '22:00' }],
        wt: [],
        sr: [],
        czw: [],
        pt: [],
        sob: [],
        nd: [],
      },
      '2026-06-15': {
        pon: [{ employeeId: 'e2', start: '12:00', end: '22:00' }],
        wt: [],
        sr: [],
        czw: [],
        pt: [],
        sob: [],
        nd: [],
      },
    })

    expect(merged['2026-06-08'].pon[0].employeeId).toBe('e1')
    expect(merged['2026-06-15'].pon[0].employeeId).toBe('e2')
  })

  it('seeds demo schedule only on first visit', () => {
    const currentKey = getWeekKey()
    const merged = mergeSchedules(undefined, undefined)
    expect(merged[currentKey]).toEqual(DEMO_WEEK_SCHEDULE)
  })
})

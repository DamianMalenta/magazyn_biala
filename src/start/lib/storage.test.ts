import { describe, expect, it } from 'vitest'
import { mergeSchedule } from './storage'

describe('mergeSchedule', () => {
  it('returns demo schedule only when nothing was saved', () => {
    const merged = mergeSchedule(undefined)
    expect(merged.pon.length).toBeGreaterThan(0)
    expect(merged.nd).toEqual([])
  })

  it('does not inject demo hours into days missing from saved schedule', () => {
    const merged = mergeSchedule({
      pon: [{ employeeId: 'e1', start: '11:00', end: '22:00' }],
      wt: [{ employeeId: 'e1', start: '11:00', end: '22:00' }],
    })

    expect(merged.pon).toEqual([{ employeeId: 'e1', start: '11:00', end: '22:00' }])
    expect(merged.wt).toEqual([{ employeeId: 'e1', start: '11:00', end: '22:00' }])
    expect(merged.sr).toEqual([])
    expect(merged.czw).toEqual([])
    expect(merged.pt).toEqual([])
    expect(merged.sob).toEqual([])
    expect(merged.nd).toEqual([])
  })

  it('keeps explicit empty days from saved schedule', () => {
    const merged = mergeSchedule({
      pon: [{ employeeId: 'e1', start: '12:00', end: '22:00' }],
      nd: [],
    })

    expect(merged.pon).toHaveLength(1)
    expect(merged.nd).toEqual([])
    expect(merged.sob).toEqual([])
  })
})

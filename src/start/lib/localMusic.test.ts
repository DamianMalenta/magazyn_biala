import { describe, expect, it } from 'vitest'
import { playlistLabel, shuffleInPlace } from './localMusic'

describe('localMusic helpers', () => {
  it('maps known playlist folder ids to labels', () => {
    expect(playlistLabel('pop-radio')).toBe('Pop & Radio — młodzież')
    expect(playlistLabel('unknown-folder')).toBe('unknown-folder')
  })

  it('shuffles array in place', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffleInPlace([...original])
    expect(shuffled).toHaveLength(5)
    expect(shuffled.sort()).toEqual(original.sort())
  })
})

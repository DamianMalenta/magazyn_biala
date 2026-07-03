import { describe, expect, it, vi } from 'vitest'
import {
  loadRememberedFolderName,
  playlistLabel,
  saveRememberedFolderName,
  shuffleInPlace,
} from './localMusic'

describe('localMusic helpers', () => {
  it('maps known playlist folder ids to labels', () => {
    expect(playlistLabel('pop-radio')).toBe('Pop & Radio — młodzież')
    expect(playlistLabel('polskie')).toBe('Polskie')
    expect(playlistLabel('unknown-folder')).toBe('unknown-folder')
  })

  it('shuffles array in place', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffleInPlace([...original])
    expect(shuffled).toHaveLength(5)
    expect(shuffled.sort()).toEqual(original.sort())
  })

  it('remembers folder name in localStorage', () => {
    const storage = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
    })
    saveRememberedFolderName('lokalnie')
    expect(loadRememberedFolderName()).toBe('lokalnie')
    vi.unstubAllGlobals()
  })
})

import { describe, expect, it } from 'vitest'
import {
  categoriesForTab,
  defaultCategoryForTab,
  inferTabAndCategory,
  isAllowedStreamCodec,
  streamUrlsForStation,
  tabForCategory,
  type MusicStation,
} from './musicUtils'

describe('isAllowedStreamCodec', () => {
  it('accepts MP3 and AAC variants', () => {
    expect(isAllowedStreamCodec('MP3')).toBe(true)
    expect(isAllowedStreamCodec('aac')).toBe(true)
    expect(isAllowedStreamCodec('AAC+')).toBe(true)
  })

  it('rejects unknown codecs', () => {
    expect(isAllowedStreamCodec('OGG')).toBe(false)
    expect(isAllowedStreamCodec(undefined)).toBe(false)
  })
})

describe('streamUrlsForStation', () => {
  it('deduplicates primary and fallback URLs', () => {
    const station: MusicStation = {
      id: 'test',
      name: 'Test',
      streamUrl: 'https://example.com/a',
      fallbackUrls: ['https://example.com/a', 'https://example.com/b'],
      source: 'preset',
    }
    expect(streamUrlsForStation(station)).toEqual(['https://example.com/a', 'https://example.com/b'])
  })
})

describe('music tabs', () => {
  it('assigns Polish category to commercial tab', () => {
    expect(tabForCategory('pl')).toBe('commercial')
    expect(tabForCategory('lounge')).toBe('non-commercial')
  })

  it('lists only non-commercial categories in non-commercial tab', () => {
    const ids = categoriesForTab('non-commercial').map((c) => c.id)
    expect(ids).toEqual(['lounge', 'jazz', 'chill', 'pop'])
    expect(ids).not.toContain('pl')
  })

  it('lists only Polish category in commercial tab', () => {
    const ids = categoriesForTab('commercial').map((c) => c.id)
    expect(ids).toEqual(['pl'])
  })

  it('defaults commercial tab to Polish category', () => {
    expect(defaultCategoryForTab('commercial')).toBe('pl')
    expect(defaultCategoryForTab('non-commercial')).toBe('lounge')
  })

  it('infers commercial tab from RMF preset', () => {
    const result = inferTabAndCategory({
      id: 'rmf-fm',
      name: 'RMF FM',
      streamUrl: 'https://example.com/rmf',
      source: 'preset',
    })
    expect(result).toEqual({ tab: 'commercial', category: 'pl' })
  })

  it('infers non-commercial tab from lounge preset', () => {
    const result = inferTabAndCategory({
      id: 'soma-groove',
      name: 'SomaFM',
      streamUrl: 'https://example.com/groove',
      source: 'preset',
    })
    expect(result).toEqual({ tab: 'non-commercial', category: 'lounge' })
  })
})

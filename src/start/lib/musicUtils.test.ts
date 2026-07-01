import { describe, expect, it } from 'vitest'
import {
  categoriesForTab,
  defaultCategoryForTab,
  inferTabAndCategory,
  isAllowedStreamCodec,
  isLocalCategory,
  stationsForCategory,
  stationsWithOnlineForCategory,
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

describe('music tabs and categories', () => {
  it('assigns Polish radio to commercial tab', () => {
    expect(tabForCategory('polskie-radio')).toBe('commercial')
    expect(tabForCategory('radio')).toBe('non-commercial')
    expect(tabForCategory('lokalne')).toBe('non-commercial')
    expect(tabForCategory('lokalne-kom')).toBe('commercial')
  })

  it('lists radio and lokalne in non-commercial tab', () => {
    const ids = categoriesForTab('non-commercial').map((c) => c.id)
    expect(ids).toEqual(['radio', 'lokalne'])
  })

  it('lists polskie-radio and lokalne in commercial tab', () => {
    const ids = categoriesForTab('commercial').map((c) => c.id)
    expect(ids).toEqual(['polskie-radio', 'lokalne-kom'])
  })

  it('defaults each tab to first category', () => {
    expect(defaultCategoryForTab('commercial')).toBe('polskie-radio')
    expect(defaultCategoryForTab('non-commercial')).toBe('radio')
  })

  it('marks local categories', () => {
    expect(isLocalCategory('lokalne')).toBe(true)
    expect(isLocalCategory('lokalne-kom')).toBe(true)
    expect(isLocalCategory('radio')).toBe(false)
  })

  it('includes international presets in radio category', () => {
    const stations = stationsForCategory('radio')
    expect(stations.some((s) => s.id === 'soma-groove')).toBe(true)
    expect(stations.some((s) => s.id === 'soma-indie')).toBe(true)
    expect(stations).toHaveLength(12)
  })

  it('keeps local categories empty until configured', () => {
    expect(stationsForCategory('lokalne')).toEqual([])
    expect(stationsForCategory('lokalne-kom')).toEqual([])
  })

  it('includes Polish presets in polskie-radio category', () => {
    const stations = stationsForCategory('polskie-radio')
    expect(stations.map((s) => s.id)).toEqual(['rmf-maxxx', 'rmf-fm', 'radio-zet'])
  })

  it('infers commercial tab from RMF preset', () => {
    const result = inferTabAndCategory({
      id: 'rmf-fm',
      name: 'RMF FM',
      streamUrl: 'https://example.com/rmf',
      source: 'preset',
    })
    expect(result).toEqual({ tab: 'commercial', category: 'polskie-radio' })
  })

  it('infers non-commercial radio tab from SomaFM preset', () => {
    const result = inferTabAndCategory({
      id: 'soma-groove',
      name: 'SomaFM',
      streamUrl: 'https://example.com/groove',
      source: 'preset',
    })
    expect(result).toEqual({ tab: 'non-commercial', category: 'radio' })
  })
})

describe('stationsWithOnlineForCategory', () => {
  it('returns presets only for local categories', async () => {
    await expect(stationsWithOnlineForCategory('lokalne')).resolves.toEqual([])
    await expect(stationsWithOnlineForCategory('lokalne-kom')).resolves.toEqual([])
  })
})

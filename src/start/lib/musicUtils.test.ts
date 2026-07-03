import { describe, expect, it } from 'vitest'
import {
  categoriesForTab,
  defaultCategoryForTab,
  inferTabAndCategory,
  isAllowedStreamCodec,
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
    expect(tabForCategory('stacje-radiowe')).toBe('non-commercial')
    expect(tabForCategory('lokalnie')).toBe('non-commercial')
    expect(tabForCategory('lokalne-kom')).toBe('commercial')
  })

  it('lists stacje radiowe and lokalnie in non-commercial tab', () => {
    const ids = categoriesForTab('non-commercial').map((c) => c.id)
    expect(ids).toEqual(['stacje-radiowe', 'lokalnie'])
  })

  it('lists polskie-radio and lokalne in commercial tab', () => {
    const ids = categoriesForTab('commercial').map((c) => c.id)
    expect(ids).toEqual(['polskie-radio', 'lokalne-kom'])
  })

  it('defaults each tab to first category', () => {
    expect(defaultCategoryForTab('commercial')).toBe('polskie-radio')
    expect(defaultCategoryForTab('non-commercial')).toBe('stacje-radiowe')
  })

  it('includes international presets in stacje-radiowe', () => {
    const stations = stationsForCategory('stacje-radiowe')
    expect(stations.some((s) => s.id === 'soma-groove')).toBe(true)
    expect(stations).toHaveLength(12)
  })

  it('includes local playlist presets in lokalnie', () => {
    const stations = stationsForCategory('lokalnie')
    expect(stations.length).toBeGreaterThanOrEqual(8)
    expect(stations[0].source).toBe('local-files')
    expect(stations[0].streamUrl).toMatch(/^local:\/\//)
    expect(stations.some((s) => s.id === 'local-pop-radio')).toBe(true)
    expect(stations.some((s) => s.id === 'local-polskie')).toBe(true)
  })

  it('keeps commercial local category empty until configured', () => {
    expect(stationsForCategory('lokalne-kom')).toEqual([])
  })

  it('includes Polish presets in polskie-radio', () => {
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

  it('infers non-commercial stacje-radiowe from SomaFM preset', () => {
    const result = inferTabAndCategory({
      id: 'soma-groove',
      name: 'SomaFM',
      streamUrl: 'https://example.com/groove',
      source: 'preset',
    })
    expect(result).toEqual({ tab: 'non-commercial', category: 'stacje-radiowe' })
  })

  it('infers lokalnie from local playlist preset', () => {
    const result = inferTabAndCategory({
      id: 'local-pop-radio',
      name: 'Pop & Radio',
      streamUrl: 'local://pop-radio',
      source: 'local-files',
      localFolder: 'pop-radio',
    })
    expect(result).toEqual({ tab: 'non-commercial', category: 'lokalnie' })
  })
})

describe('stationsWithOnlineForCategory', () => {
  it('returns presets only for lokalnie without online search', async () => {
    const stations = await stationsWithOnlineForCategory('lokalnie')
    expect(stations.length).toBeGreaterThanOrEqual(7)
  })

  it('returns empty for commercial local category', async () => {
    await expect(stationsWithOnlineForCategory('lokalne-kom')).resolves.toEqual([])
  })
})

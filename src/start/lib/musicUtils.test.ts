import { describe, expect, it } from 'vitest'
import { isAllowedStreamCodec, streamUrlsForStation, type MusicStation } from './musicUtils'

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

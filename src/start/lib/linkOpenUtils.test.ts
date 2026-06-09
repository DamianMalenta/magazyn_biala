import { describe, expect, it } from 'vitest'
import type { QuickLink } from '../types'
import { resolveLinkOpenMode } from './linkOpenUtils'

function link(overrides: Partial<QuickLink> = {}): QuickLink {
  return {
    id: '1',
    label: 'Test',
    url: 'https://example.com',
    icon: '🔗',
    iconMode: 'auto',
    openMode: 'shell',
    embedSize: 'medium',
    color: '#000',
    pinned: true,
    ...overrides,
  }
}

describe('resolveLinkOpenMode', () => {
  it('uses workspace default when tile has no explicit openMode', () => {
    const tile = link({ openMode: undefined as unknown as QuickLink['openMode'] })
    expect(resolveLinkOpenMode(tile, 'tab')).toBe('tab')
    expect(resolveLinkOpenMode(tile, 'shell')).toBe('shell')
  })

  it('prefers explicit tile openMode over workspace default', () => {
    expect(resolveLinkOpenMode(link({ openMode: 'tab' }), 'shell')).toBe('tab')
    expect(resolveLinkOpenMode(link({ openMode: 'embed' }), 'tab')).toBe('embed')
  })

  it('defaults music tiles to embed and maps shell to embed', () => {
    const music = link({
      url: 'music://player',
      linkType: 'music',
      openMode: undefined as unknown as QuickLink['openMode'],
    })
    expect(resolveLinkOpenMode(music, 'tab')).toBe('embed')

    const musicShell = link({ url: 'music://player', linkType: 'music', openMode: 'shell' })
    expect(resolveLinkOpenMode(musicShell, 'tab')).toBe('embed')
  })

  it('allows music tiles to open in a new tab when configured', () => {
    const musicTab = link({ url: 'music://player', linkType: 'music', openMode: 'tab' })
    expect(resolveLinkOpenMode(musicTab, 'shell')).toBe('tab')
  })
})

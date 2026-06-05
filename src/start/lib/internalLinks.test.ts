import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isInternalModuleUrl, resolveInternalEmbedUrl, resolveQuickLinkUrl } from './internalLinks'

const ORIGIN = 'https://damianmalenta.github.io'
const START = `${ORIGIN}/magazyn_biala/start.html`
const INDEX = `${ORIGIN}/magazyn_biala/index.html`
const ROOT = `${ORIGIN}/magazyn_biala/`

function mockWindow(href: string) {
  const parsed = new URL(href)
  vi.stubGlobal('window', {
    location: parsed,
    history: { replaceState: vi.fn() },
  })
}

describe('internalLinks', () => {
  beforeEach(() => {
    mockWindow(START)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps absolute same-origin URLs', () => {
    expect(resolveQuickLinkUrl(ROOT)).toBe(ROOT)
  })

  it('treats magazyn root and index as internal', () => {
    expect(isInternalModuleUrl(ROOT)).toBe(true)
    expect(isInternalModuleUrl(INDEX)).toBe(true)
  })

  it('treats start.html path as internal when not current document', () => {
    mockWindow(INDEX)
    expect(isInternalModuleUrl(START)).toBe(true)
  })

  it('rejects self-embed of current start page', () => {
    expect(isInternalModuleUrl(START)).toBe(false)
  })

  it('rejects other origins', () => {
    expect(isInternalModuleUrl('https://www.facebook.com')).toBe(false)
  })

  it('maps start.html to index.html for embed', () => {
    expect(resolveInternalEmbedUrl(START)).toBe(INDEX)
  })

  it('appends index.html for directory URLs', () => {
    expect(resolveInternalEmbedUrl(ROOT)).toBe(INDEX)
  })
})

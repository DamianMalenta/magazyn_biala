import { describe, expect, it } from 'vitest'
import { parseMessengerText } from './parseMessenger'
import { extractQuantityAndName } from './quantityExtractor'
import { normalizeUOM } from './uomNormalizer'
import { classifyLine } from './categoryStateMachine'
import { matchSkuName } from './aliasMatcher'
import { DEFAULT_INVENTORY } from '../data/defaultInventory'
import { buildParserConfig, DEFAULT_APP_CONFIG } from '../data/defaultConfig'

const PARSER_CONFIG = buildParserConfig(DEFAULT_APP_CONFIG)

const EXAMPLE = `Magazyn biala 04.06 14:00
zamrażalnik 
4x nugetsy 
5x skrzydełka
2x szyszki
1x papryka worek
poledwiczki surowe worek
1 pojemnik krewetek 
3 kg frytki
lodówka 
2x jogurt grecki
2 kg ser mozzarella
7x salami zwykle
1x sos czosnkowy
opakowania
10x kartony małe
50 opakowań na makarony
20 x wieczka na makarony
1 sztućce (łyżka i nóż)`

describe('uomNormalizer', () => {
  it('maps raw units to standard UOM', () => {
    expect(normalizeUOM('x', PARSER_CONFIG)).toBe('szt.')
    expect(normalizeUOM('kg', PARSER_CONFIG)).toBe('kg.')
    expect(normalizeUOM('worek', PARSER_CONFIG)).toBe('opak.')
    expect(normalizeUOM('opakowań', PARSER_CONFIG)).toBe('opak.')
    expect(normalizeUOM(undefined, PARSER_CONFIG)).toBe('szt.')
  })
})

describe('quantityExtractor', () => {
  it('parses leading quantity with x unit', () => {
    const r = extractQuantityAndName('4x nugetsy', PARSER_CONFIG)
    expect(r.qty).toBe(4)
    expect(r.unit).toBe('szt.')
    expect(r.cleanName).toBe('nugetsy')
  })

  it('parses spaced x unit', () => {
    const r = extractQuantityAndName('20 x wieczka na makarony', PARSER_CONFIG)
    expect(r.qty).toBe(20)
    expect(r.unit).toBe('szt.')
  })

  it('parses trailing worek without leading qty', () => {
    const r = extractQuantityAndName('poledwiczki surowe worek', PARSER_CONFIG)
    expect(r.qty).toBe(1)
    expect(r.unit).toBe('opak.')
    expect(r.cleanName).toContain('poledwiczki')
  })

  it('parses pojemnik krewetek', () => {
    const r = extractQuantityAndName('1 pojemnik krewetek', PARSER_CONFIG)
    expect(r.qty).toBe(1)
    expect(r.unit).toBe('opak.')
    expect(r.cleanName).toContain('krewetek')
  })
})

describe('categoryStateMachine', () => {
  it('detects category headers', () => {
    expect(classifyLine('zamrażalnik', PARSER_CONFIG).kind).toBe('category')
    expect(classifyLine('lodówka', PARSER_CONFIG).kind).toBe('category')
    expect(classifyLine('opakowania', PARSER_CONFIG).kind).toBe('category')
  })

  it('does not treat numbered lines as categories', () => {
    expect(classifyLine('50 opakowań na makarony', PARSER_CONFIG).kind).toBe('item')
  })

  it('ignores metadata lines', () => {
    expect(classifyLine('Magazyn biala 04.06 14:00', PARSER_CONFIG).kind).toBe('ignore')
  })
})

describe('aliasMatcher', () => {
  const names = DEFAULT_INVENTORY.map((i) => i.name)

  it('matches aliases longest-first', () => {
    expect(matchSkuName('ser mozzarella', names, PARSER_CONFIG)?.canonical).toBe('Ser Mozzarella')
    expect(matchSkuName('salami zwykle', names, PARSER_CONFIG)?.canonical).toBe('Salami')
    expect(matchSkuName('pojemnik krewetek', names, PARSER_CONFIG)?.canonical).toBe('Krewetki')
  })
})

describe('parseMessengerText — example message', () => {
  it('recognizes all items without quarantine', () => {
    const result = parseMessengerText(EXAMPLE, DEFAULT_INVENTORY, PARSER_CONFIG)
    expect(result.quarantine).toHaveLength(0)
    expect(result.updates.size).toBe(15)
  })

  it('assigns correct quantities', () => {
    const result = parseMessengerText(EXAMPLE, DEFAULT_INVENTORY, PARSER_CONFIG)
    const byName = (name: string) => DEFAULT_INVENTORY.find((i) => i.name === name)?.id

    expect(result.updates.get(byName('Nugetsy')!)).toBe(4)
    expect(result.updates.get(byName('Skrzydełka')!)).toBe(5)
    expect(result.updates.get(byName('Frytki')!)).toBe(3)
    expect(result.updates.get(byName('Ser Mozzarella')!)).toBe(2)
    expect(result.updates.get(byName('Opakowania na makarony')!)).toBe(50)
    expect(result.updates.get(byName('Wieczka na makarony')!)).toBe(20)
  })
})

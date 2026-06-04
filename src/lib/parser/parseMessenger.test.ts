import { describe, expect, it } from 'vitest'
import { parseMessengerText } from './parseMessenger'
import { extractQuantityAndName } from './quantityExtractor'
import { normalizeUOM } from './uomNormalizer'
import { classifyLine, isMetaLine } from './categoryStateMachine'
import { buildAliasEntries, matchSkuName } from './aliasMatcher'
import { DEFAULT_INVENTORY } from '../data/defaultInventory'

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
    expect(normalizeUOM('x')).toBe('szt.')
    expect(normalizeUOM('kg')).toBe('kg.')
    expect(normalizeUOM('worek')).toBe('opak.')
    expect(normalizeUOM('opakowań')).toBe('opak.')
    expect(normalizeUOM(undefined)).toBe('szt.')
  })
})

describe('quantityExtractor', () => {
  it('parses leading quantity with x unit', () => {
    const r = extractQuantityAndName('4x nugetsy')
    expect(r.qty).toBe(4)
    expect(r.unit).toBe('szt.')
    expect(r.cleanName).toBe('nugetsy')
  })

  it('parses spaced x unit', () => {
    const r = extractQuantityAndName('20 x wieczka na makarony')
    expect(r.qty).toBe(20)
    expect(r.unit).toBe('szt.')
  })

  it('parses trailing worek without leading qty', () => {
    const r = extractQuantityAndName('poledwiczki surowe worek')
    expect(r.qty).toBe(1)
    expect(r.unit).toBe('opak.')
    expect(r.cleanName).toContain('poledwiczki')
  })

  it('parses pojemnik krewetek', () => {
    const r = extractQuantityAndName('1 pojemnik krewetek')
    expect(r.qty).toBe(1)
    expect(r.unit).toBe('opak.')
    expect(r.cleanName).toContain('krewetek')
  })
})

describe('categoryStateMachine', () => {
  it('detects category headers', () => {
    expect(classifyLine('zamrażalnik').kind).toBe('category')
    expect(classifyLine('lodówka').kind).toBe('category')
    expect(classifyLine('opakowania').kind).toBe('category')
  })

  it('does not treat numbered lines as categories', () => {
    expect(classifyLine('50 opakowań na makarony').kind).toBe('item')
  })

  it('ignores metadata lines', () => {
    expect(classifyLine('Magazyn biala 04.06 14:00').kind).toBe('ignore')
    expect(isMetaLine('Magazyn biala 04.06 14:00')).toBe(true)
    expect(isMetaLine('14:00 aktualizacja')).toBe(true)
  })
})

describe('aliasMatcher', () => {
  const names = DEFAULT_INVENTORY.map((i) => i.name)
  const entries = buildAliasEntries(DEFAULT_INVENTORY)

  it('matches aliases longest-first', () => {
    expect(matchSkuName('ser mozzarella', names, entries)?.canonical).toBe('Ser Mozzarella')
    expect(matchSkuName('salami zwykle', names, entries)?.canonical).toBe('Salami')
    expect(matchSkuName('pojemnik krewetek', names, entries)?.canonical).toBe('Krewetki')
  })

  it('matches user-learned aliases', () => {
    const nugetsy = DEFAULT_INVENTORY.find((i) => i.name === 'Nugetsy')!
    const custom = { [nugetsy.id]: ['nugetsy extra hot'] }
    const withCustom = buildAliasEntries(DEFAULT_INVENTORY, custom)
    expect(matchSkuName('nugetsy extra hot', names, withCustom)?.confidence).toBe('learned')
    expect(matchSkuName('nugetsy extra hot', names, withCustom)?.canonical).toBe('Nugetsy')
  })
})

describe('parseMessengerText — category snapshot', () => {
  it('zeros unmentioned SKUs only in touched category', () => {
    const inventory = DEFAULT_INVENTORY.map((item) => ({ ...item }))
    const nugetsy = inventory.find((i) => i.name === 'Nugetsy')!
    const jogurt = inventory.find((i) => i.name === 'Jogurt grecki')!
    const salami = inventory.find((i) => i.name === 'Salami')!
    nugetsy.qty = 10
    jogurt.qty = 3
    salami.qty = 7

    const text = `lodówka
2x jogurt grecki`

    const result = parseMessengerText(text, inventory)

    expect(result.touchedCategories).toEqual(['LODÓWKA'])
    expect(result.updates.get(jogurt.id)).toBe(2)
    expect(result.updates.get(salami.id)).toBe(0)
    expect(result.updates.has(nugetsy.id)).toBe(false)
  })

  it('updates multiple touched categories, leaves others unchanged', () => {
    const inventory = DEFAULT_INVENTORY.map((item) => ({ ...item }))
    const kartony = inventory.find((i) => i.name === 'Kartony małe')!
    kartony.qty = 99

    const text = `lodówka
1x jogurt grecki
zamrażalnik
4x nugetsy`

    const result = parseMessengerText(text, inventory)

    expect(result.touchedCategories).toContain('LODÓWKA')
    expect(result.touchedCategories).toContain('ZAMRAŻARKA')
    expect(result.touchedCategories).not.toContain('OPAKOWANIA')
    expect(result.updates.has(kartony.id)).toBe(false)
  })
})

describe('parseMessengerText — example message', () => {
  it('recognizes all items without quarantine', () => {
    const result = parseMessengerText(EXAMPLE, DEFAULT_INVENTORY)
    expect(result.quarantine).toHaveLength(0)
    expect(result.updates.size).toBe(15)
    expect(result.touchedCategories).toEqual(
      expect.arrayContaining(['LODÓWKA', 'ZAMRAŻARKA', 'OPAKOWANIA']),
    )
  })

  it('assigns correct quantities', () => {
    const result = parseMessengerText(EXAMPLE, DEFAULT_INVENTORY)
    const byName = (name: string) =>
      DEFAULT_INVENTORY.find((i) => i.name === name)?.id

    expect(result.updates.get(byName('Nugetsy')!)).toBe(4)
    expect(result.updates.get(byName('Skrzydełka')!)).toBe(5)
    expect(result.updates.get(byName('Frytki')!)).toBe(3)
    expect(result.updates.get(byName('Ser Mozzarella')!)).toBe(2)
    expect(result.updates.get(byName('Opakowania na makarony')!)).toBe(50)
    expect(result.updates.get(byName('Wieczka na makarony')!)).toBe(20)
  })

  it('uses custom aliases when parsing', () => {
    const nugetsy = DEFAULT_INVENTORY.find((i) => i.name === 'Nugetsy')!
    const custom = { [nugetsy.id]: ['4x nugetsy premium'] }
    const text = 'zamrażalnik\n4x nugetsy premium'
    const result = parseMessengerText(text, DEFAULT_INVENTORY, custom)
    expect(result.quarantine).toHaveLength(0)
    expect(result.updates.get(nugetsy.id)).toBe(4)
  })
})

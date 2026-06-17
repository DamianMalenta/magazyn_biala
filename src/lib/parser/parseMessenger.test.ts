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

  it('parses kartony with adjective', () => {
    const r = extractQuantityAndName('3x kartony duży')
    expect(r.qty).toBe(3)
    expect(r.cleanName).toContain('kartony')
    expect(r.cleanName).toContain('duż')
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
    expect(classifyLine('Lodówka 04.06').kind).toBe('category')
    expect(classifyLine('Zamrazalka 04.06').kind).toBe('category')
    expect(classifyLine('Opakowania 04.06').kind).toBe('category')
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
  const inventory = DEFAULT_INVENTORY
  const entries = buildAliasEntries(DEFAULT_INVENTORY)

  it('matches aliases longest-first', () => {
    expect(matchSkuName('ser mozzarella', inventory, entries)?.canonical).toBe('Ser Mozzarella')
    expect(matchSkuName('salami zwykle', inventory, entries)?.canonical).toBe('Salami')
    expect(matchSkuName('pojemnik krewetek', inventory, entries)?.canonical).toBe('Krewetki')
  })

  it('does not map salami picante to plain salami', () => {
    expect(matchSkuName('salami picante', inventory, entries)?.canonical).toBe('Salami pikantne')
    expect(matchSkuName('salami', inventory, entries)?.canonical).toBe('Salami')
  })

  it('prefers frozen zapiekanki in zamrażarka zone', () => {
    expect(
      matchSkuName('zapiekanki', inventory, entries, 'ZAMRAŻARKA')?.canonical,
    ).toBe('Zapiekanki')
    expect(
      matchSkuName('opakowania zapiekanki', inventory, entries, 'OPAKOWANIA')?.canonical,
    ).toBe('Kartony zapiekanki')
  })

  it('matches kartony by size in cm', () => {
    expect(matchSkuName('kartony 37 cm', inventory, entries)?.canonical).toBe('Kartony duże')
    expect(matchSkuName('kartony 30 cm', inventory, entries)?.canonical).toBe('Kartony małe')
  })

  it('matches user-learned aliases', () => {
    const nugetsy = DEFAULT_INVENTORY.find((i) => i.name === 'Nugetsy')!
    const custom = { [nugetsy.id]: ['nugetsy extra hot'] }
    const withCustom = buildAliasEntries(DEFAULT_INVENTORY, custom)
    expect(matchSkuName('nugetsy extra hot', inventory, withCustom)?.confidence).toBe('learned')
    expect(matchSkuName('nugetsy extra hot', inventory, withCustom)?.canonical).toBe('Nugetsy')
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

  it('parses real renament with dated zone headers', () => {
    const USER_TEXT = `Lodówka 04.06 
4x jogurt grecki 
7 x salami
4x salami pikanterii
4x rwana wieprzowina 
3x pekińska kapusta
2 x lodowa sałata 

Zamrazalka 04.06
3x kuweta polędwiczki
4x skrzydełka 
2x szyszki ziemniaczane 
3x nuggetsy
5x frytki

Opakowania 04.06
3x kartony duży
3x kartony mały 
3x kartony pizzerinki
1x kartony zapiekanki
2x frytki male
1x frytki duze
6x opakowania makarony
6x wieczka makarony 
1 karton serwetki( 40 małych opakowan do dyspenserow)`

    const result = parseMessengerText(USER_TEXT, DEFAULT_INVENTORY)
    expect(result.touchedCategories).toEqual(
      expect.arrayContaining(['LODÓWKA', 'ZAMRAŻARKA', 'OPAKOWANIA']),
    )
    expect(result.quarantine.length).toBeLessThanOrEqual(1)
    const byName = (n: string) => DEFAULT_INVENTORY.find((i) => i.name === n)!
    expect(result.updates.get(byName('Salami').id)).toBe(7)
    expect(result.updates.get(byName('Salami pikantne').id)).toBe(4)
    expect(result.updates.get(byName('Kartony duże').id)).toBe(3)
    expect(result.updates.get(byName('Frytki').id)).toBe(5)
    expect(result.updates.get(byName('Frytki małe').id)).toBe(2)
  })

  it('uses custom aliases when parsing', () => {
    const nugetsy = DEFAULT_INVENTORY.find((i) => i.name === 'Nugetsy')!
    const custom = { [nugetsy.id]: ['4x nugetsy premium'] }
    const text = 'zamrażalnik\n4x nugetsy premium'
    const result = parseMessengerText(text, DEFAULT_INVENTORY, custom)
    expect(result.quarantine).toHaveLength(0)
    expect(result.updates.get(nugetsy.id)).toBe(4)
  })

  it('parses renament 15.06 with szynka, zapiekanki and cm kartons', () => {
    const USER_TEXT = `Lodówka 15.06
5x salami picante
3x salami
2x jogurt
Zamrazalka 15.06
2 kg polędwiczki surowe
1x opakowanie polędwiczki
3x nuggetsy
2x szyszki
2x skrzydełka
11x szynka
35x zapiekanki
Opakowania 15.06
6x opakowania frytki duże (po 50 szt.)
1x opakowania frytki małe (po 100 szt.)
5x opakowania pizzerinki (po 100 szt.)
1x karton serwetek
3x opakowania zapiekanki (po 100 szt.)
6x opakowania makarony (po 50 szt.)
6x wieczka do makaronów (po 50 szt.)
4x kartony 37 cm (po 100 szt.)
4x kartony 30 cm (po 100 szt.)`

    const result = parseMessengerText(USER_TEXT, DEFAULT_INVENTORY)
    const byName = (n: string) => DEFAULT_INVENTORY.find((i) => i.name === n)!

    expect(result.quarantine).toHaveLength(0)
    expect(result.updates.get(byName('Salami pikantne').id)).toBe(5)
    expect(result.updates.get(byName('Salami').id)).toBe(3)
    expect(result.updates.get(byName('Jogurt grecki').id)).toBe(2)
    expect(result.updates.get(byName('Polędwiczki surowe').id)).toBe(3)
    expect(result.updates.get(byName('Nugetsy').id)).toBe(3)
    expect(result.updates.get(byName('Szynka').id)).toBe(11)
    expect(result.updates.get(byName('Zapiekanki').id)).toBe(35)
    expect(result.updates.get(byName('Kartony zapiekanki').id)).toBe(3)
    expect(result.updates.get(byName('Kartony duże').id)).toBe(4)
    expect(result.updates.get(byName('Kartony małe').id)).toBe(4)
    expect(result.updates.get(byName('Frytki duże').id)).toBe(6)
    expect(result.updates.get(byName('Wieczka na makarony').id)).toBe(6)
  })
})

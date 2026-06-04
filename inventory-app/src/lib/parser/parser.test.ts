import { describe, expect, it } from 'vitest'
import { DEFAULT_ALIASES, DEFAULT_INVENTORY } from '@/lib/dictionary/defaultInventory'
import { parseMessengerText } from './index'

const EXAMPLE_MESSAGE = `Magazyn biala 04.06 14:00
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

describe('parseMessengerText', () => {
  it('parses the full example message with zero quarantine', () => {
    const result = parseMessengerText(
      EXAMPLE_MESSAGE,
      DEFAULT_INVENTORY,
      DEFAULT_ALIASES,
    )

    expect(result.quarantine).toHaveLength(0)
    expect(result.updates).toHaveLength(15)

    const byName = Object.fromEntries(
      result.updates.map((u) => [u.skuName, u.qty]),
    )

    expect(byName['Nugetsy']).toBe(4)
    expect(byName['Skrzydełka']).toBe(5)
    expect(byName['Szyszki']).toBe(2)
    expect(byName['Papryka']).toBe(1)
    expect(byName['Polędwiczki surowe']).toBe(1)
    expect(byName['Krewetki']).toBe(1)
    expect(byName['Frytki']).toBe(3)
    expect(byName['Jogurt grecki']).toBe(2)
    expect(byName['Ser Mozzarella']).toBe(2)
    expect(byName['Salami']).toBe(7)
    expect(byName['Sos czosnkowy']).toBe(1)
    expect(byName['Kartony małe']).toBe(10)
    expect(byName['Opakowania na makarony']).toBe(50)
    expect(byName['Wieczka na makarony']).toBe(20)
    expect(byName['Sztućce (łyżka i nóż)']).toBe(1)
  })

  it('uses category state machine for zone headers', () => {
    const result = parseMessengerText(
      'zamrażalnik\n4x nugetsy\nlodówka\n2x jogurt grecki',
      DEFAULT_INVENTORY,
      DEFAULT_ALIASES,
    )
    expect(result.logs.some((l) => l.message.includes('ZAMRAŻARKA'))).toBe(true)
    expect(result.logs.some((l) => l.message.includes('LODÓWKA'))).toBe(true)
  })

  it('defaults missing quantity to 1 szt.', () => {
    const result = parseMessengerText(
      'zamrażalnik\npoledwiczki surowe worek',
      DEFAULT_INVENTORY,
      DEFAULT_ALIASES,
    )
    const match = result.updates.find((u) => u.skuName === 'Polędwiczki surowe')
    expect(match?.qty).toBe(1)
  })

  it('sends unknown items to quarantine', () => {
    const result = parseMessengerText(
      'lodówka\n1x nieznany produkt xyz',
      DEFAULT_INVENTORY,
      DEFAULT_ALIASES,
    )
    expect(result.quarantine).toHaveLength(1)
    expect(result.quarantine[0].rawName).toContain('nieznany')
  })
})

describe('aliasMatcher greedy prevention', () => {
  it('prefers ser mozzarella over generic ser', () => {
    const result = parseMessengerText(
      'lodówka\n2 kg ser mozzarella',
      DEFAULT_INVENTORY,
      DEFAULT_ALIASES,
    )
    expect(result.updates[0]?.skuName).toBe('Ser Mozzarella')
  })
})

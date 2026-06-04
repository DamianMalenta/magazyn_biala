import { describe, expect, it } from 'vitest'
import { DEFAULT_INVENTORY } from '../defaultInventory'
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

describe('parseMessengerText — example message', () => {
  it('parses all known SKUs with correct quantities', () => {
    const inventory = structuredClone(DEFAULT_INVENTORY)
    const { quarantine, updatedIds } = parseMessengerText(
      EXAMPLE_MESSAGE,
      inventory
    )

    expect(quarantine).toHaveLength(0)

    const byName = (name: string) =>
      inventory.find((i) => i.name === name)!

    expect(byName('Nugetsy').qty).toBe(4)
    expect(byName('Skrzydełka').qty).toBe(5)
    expect(byName('Szyszki').qty).toBe(2)
    expect(byName('Papryka').qty).toBe(1)
    expect(byName('Polędwiczki surowe').qty).toBe(1)
    expect(byName('Krewetki').qty).toBe(1)
    expect(byName('Frytki').qty).toBe(3)
    expect(byName('Jogurt grecki').qty).toBe(2)
    expect(byName('Ser Mozzarella').qty).toBe(2)
    expect(byName('Salami').qty).toBe(7)
    expect(byName('Sos czosnkowy').qty).toBe(1)
    expect(byName('Kartony małe').qty).toBe(10)
    expect(byName('Opakowania na makarony').qty).toBe(50)
    expect(byName('Wieczka na makarony').qty).toBe(20)
    expect(byName('Sztućce (łyżka i nóż)').qty).toBe(1)

    expect(updatedIds.length).toBe(15)
  })
})

describe('category state machine', () => {
  it('assigns category context until next header', () => {
    const inventory = structuredClone(DEFAULT_INVENTORY)
    const text = `zamrażalnik
4x nugetsy
lodówka
2x jogurt grecki`

    const { quarantine } = parseMessengerText(text, inventory)
    expect(quarantine).toHaveLength(0)
    expect(inventory.find((i) => i.name === 'Nugetsy')!.qty).toBe(4)
    expect(inventory.find((i) => i.name === 'Jogurt grecki')!.qty).toBe(2)
  })
})

describe('unit normalization', () => {
  it('maps x and pojemnik to opak.', () => {
    const inventory = structuredClone(DEFAULT_INVENTORY)
    parseMessengerText('4x nugetsy\n1 pojemnik krewetek', inventory)
    expect(inventory.find((i) => i.name === 'Nugetsy')!.qty).toBe(4)
    expect(inventory.find((i) => i.name === 'Krewetki')!.qty).toBe(1)
  })

  it('defaults bare product lines to qty 1', () => {
    const inventory = structuredClone(DEFAULT_INVENTORY)
    parseMessengerText('poledwiczki surowe worek', inventory)
    expect(inventory.find((i) => i.name === 'Polędwiczki surowe')!.qty).toBe(1)
  })
})

describe('quarantine', () => {
  it('isolates unknown products', () => {
    const inventory = structuredClone(DEFAULT_INVENTORY)
    const { quarantine } = parseMessengerText(
      'zamrażalnik\n99x nieznany produkt xyz',
      inventory
    )
    expect(quarantine).toHaveLength(1)
    expect(quarantine[0].rawName).toMatch(/nieznany/i)
  })
})

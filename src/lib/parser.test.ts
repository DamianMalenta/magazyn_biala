import { describe, expect, it } from 'vitest';
import { DEFAULT_INVENTORY } from '@/lib/dictionary';
import { parseMessengerText } from '@/lib/parser';
import { extractQuantityAndName } from '@/lib/units';

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
1 sztućce (łyżka i nóż)`;

describe('extractQuantityAndName', () => {
  it('parses multiplier syntax', () => {
    expect(extractQuantityAndName('4x nugetsy')).toMatchObject({
      qty: 4,
      itemName: 'nugetsy',
    });
  });

  it('defaults missing quantity to 1', () => {
    expect(extractQuantityAndName('poledwiczki surowe worek')).toMatchObject({
      qty: 1,
      itemName: 'poledwiczki surowe worek',
    });
  });

  it('maps kg unit', () => {
    expect(extractQuantityAndName('3 kg frytki')).toMatchObject({
      qty: 3,
      unit: 'kg.',
      itemName: 'frytki',
    });
  });

  it('keeps unit word inside product alias', () => {
    expect(extractQuantityAndName('50 opakowań na makarony')).toMatchObject({
      qty: 50,
      unit: 'opak.',
      itemName: 'opakowań na makarony',
    });
  });

  it('handles spaced multiplier', () => {
    expect(extractQuantityAndName('20 x wieczka na makarony')).toMatchObject({
      qty: 20,
      itemName: 'wieczka na makarony',
    });
  });
});

describe('parseMessengerText', () => {
  it('parses the full example message', () => {
    const inventory = DEFAULT_INVENTORY.map((item) => ({ ...item }));
    const result = parseMessengerText(EXAMPLE_MESSAGE, inventory);

    const byName = Object.fromEntries(inventory.map((i) => [i.name, i.qty]));

    expect(byName['Nugetsy']).toBe(4);
    expect(byName['Skrzydełka']).toBe(5);
    expect(byName['Szyszki']).toBe(2);
    expect(byName['Papryka']).toBe(1);
    expect(byName['Polędwiczki surowe']).toBe(1);
    expect(byName['Krewetki']).toBe(1);
    expect(byName['Frytki']).toBe(3);
    expect(byName['Jogurt grecki']).toBe(2);
    expect(byName['Ser Mozzarella']).toBe(2);
    expect(byName['Salami']).toBe(7);
    expect(byName['Kartony małe']).toBe(10);
    expect(byName['Opakowania na makarony']).toBe(50);
    expect(byName['Wieczka na makarony']).toBe(20);

    expect(result.quarantine).toHaveLength(2);
    expect(result.quarantine.map((q) => q.rawName)).toEqual(
      expect.arrayContaining(['sos czosnkowy', 'sztućce (łyżka i nóż)']),
    );

    expect(result.logs.some((l) => l.type === 'category' && l.message.includes('ZAMRAŻARKA'))).toBe(
      true,
    );
    expect(result.updatedItemIds.length).toBe(13);
  });
});

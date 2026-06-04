# Magazyn Główny — Inteligentny Panel

Aplikacja do zarządzania stanami magazynu restauracji z modułem **Smart Paste** (wklejanie wiadomości z Messengera).

## Uruchomienie

```bash
cd magazyn-app
npm install
npm run dev
```

Produkcja: `npm run build` → katalog `dist/`.

Testy parsera: `npm test`.

## Architektura

| Warstwa | Opis |
|--------|------|
| `src/lib/parser/` | Silnik parsowania (maszyna stanów stref, ilości, aliasy) |
| `src/lib/dictionary.ts` | Aliasy SKU i nagłówki stref — łatwe rozszerzanie |
| `src/lib/units.ts` | Normalizacja do `kg.`, `szt.`, `opak.` |
| `src/lib/normalize.ts` | Porównania bez polskich znaków |
| `src/hooks/useInventory.ts` | Stan + `localStorage` (`magazyn_baza_v3`) |
| `src/components/` | UI: siatka magazynu, Smart Paste, kwarantanna |

### Parser

1. **Meta** — pomija linie typu „Magazyn…”, daty.
2. **Strefa** — nagłówek (`zamrażalnik`, `lodówka`, `opakowania`) ustawia kontekst do kolejnego nagłówka.
3. **Linia towaru** — wyciąga ilość i opcjonalną jednostkę; aliasy sortowane po długości (bez chciwego `op` w `opakowań`).
4. **SKU** — mapowanie na kanoniczną nazwę z bazy.
5. **Kwarantanna** — nierozpoznane pozycje z jednym kliknięciem „Dodaj do bazy”.

Nowe aliasy i produkty dodajesz w `dictionary.ts` oraz `defaultInventory.ts`.

# Magazyn Główny — wersja finalna

Aplikacja do zarządzania stanem magazynu restauracji. Wklejasz wiadomość z Messengera — parser rozpoznaje strefy (lodówka, zamrażarka, opakowania), ilości, aliasy i aktualizuje stany SKU.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** — ciemny interfejs pod pracę w magazynie
- **localStorage** — dane i aliasy użytkownika w przeglądarce
- **Vitest** — testy silnika parsowania

## Funkcje

| Moduł | Opis |
|--------|------|
| **Smart Paste** | Wklejanie tekstu z Messengera → automatyczna aktualizacja stanów |
| **Parser modułowy** | State machine stref, ekstrakcja ilości, normalizacja UOM |
| **Fuzzy matching** | Literówki w nazwach (Levenshtein) |
| **Aliasy użytkownika** | Po kwarantannie można zapamiętać alias na przyszłość |
| **Kwarantanna** | Nierozpoznane pozycje → przypisanie do SKU lub nowy produkt |
| **Eksport / import JSON** | Backup bazy między urządzeniami |
| **Demo** | Przykładowa wiadomość testowa jednym kliknięciem |

## Komendy

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm test
npm run preview
```

## Architektura

```
src/
├── lib/parser/           # Silnik parsowania (bez React)
├── lib/data/             # Katalog SKU i słownik aliasów
├── lib/storage/          # localStorage + eksport/import
├── components/
│   ├── smart-paste/      # Panel wklejania, logi, kwarantanna
│   └── inventory/        # Siatka towarów
└── context/              # Stan magazynu + aliasy
```

## Wersja legacy (bez builda)

Plik `index.legacy.html` to poprzednia wersja jednoplikowa (Vanilla JS). Otwórz go bezpośrednio w przeglądarce, jeśli nie chcesz uruchamiać Vite.

## Jednostki (UOM)

Wszystkie ilości używają standardu: `kg.`, `szt.`, `opak.`

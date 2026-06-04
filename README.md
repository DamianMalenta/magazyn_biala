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

## Jak uruchomić

### Opcja A — link online (GitHub Pages) — **zalecane dla magazynu**

Po włączeniu Pages w repozytorium aplikacja jest dostępna w przeglądarce (telefon, tablet, PC) bez instalacji Node.

1. Wejdź na https://github.com/DamianMalenta/magazyn_biala/settings/pages
2. W **Build and deployment** → **Source** wybierz **GitHub Actions**
3. Po pushu na `main` workflow sam zbuduje i opublikuje stronę (ok. 1–2 min)
4. Adres aplikacji: **https://damianmalenta.github.io/magazyn_biala/**

Dane (stany, aliasy) zapisują się w **localStorage przeglądarki** na danym urządzeniu.

### Opcja B — lokalnie na komputerze (dev / testy)

```bash
git clone https://github.com/DamianMalenta/magazyn_biala.git
cd magazyn_biala
npm install
npm run dev
```

Otwórz http://localhost:5173

### Opcja C — bez npm (stara wersja jednoplikowa)

```bash
git clone https://github.com/DamianMalenta/magazyn_biala.git
```

Otwórz w przeglądarce plik `index.legacy.html` (dwuklik lub przeciągnij do Chrome).

To uproszczona wersja bez Smart Paste w pełnej formie React — tylko gdy nie możesz uruchomić Node.

### Pobranie ZIP z GitHub

1. https://github.com/DamianMalenta/magazyn_biala → **Code** → **Download ZIP**
2. Rozpakuj, w terminalu: `npm install` → `npm run dev`  
   albo użyj `index.legacy.html` bez npm.

## Komendy developerskie

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

# Magazyn Główny — Smart Paste

Standalone inventory management app for restaurant warehouse staff. Paste raw Messenger inventory counts and the parser automatically maps them to SKUs, categories, and standard units.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4**
- **localStorage** — inventory + full parser config persisted in browser

## Features

| Module | Description |
|--------|-------------|
| **Smart Paste** | Paste Messenger text → auto-parse zones, quantities, aliases |
| **Panel Ustawień** | Full admin UI for zones, SKUs, aliases, UOM, parser, backup |
| **Category State Machine** | Headers like `zamrażalnik` / `lodówka` set the active zone |
| **Alias Dictionary** | Longest-match + fuzzy fallback — editable from UI |
| **Strict UOM** | All units normalized to `kg.`, `szt.`, or `opak.` — mappings editable |
| **Quarantine** | Unrecognized lines with one-click SKU assignment |
| **Import/Export** | JSON backup of config + inventory |

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

## Panel Ustawień (⚙️)

| Zakładka | Co konfigurujesz |
|----------|------------------|
| **Strefy** | Kategorie magazynowe, aliasy nagłówków, ikony, kolory |
| **Produkty** | Pełny katalog SKU — nazwa, strefa, jednostka |
| **Aliasy** | Słownik potocznych nazw → SKU |
| **Jednostki** | Mapowanie surowych j.m., tokeny parsera |
| **Parser** | Słowa ignorowane, fuzzy match |
| **Backup** | Eksport/import JSON, reset do domyślnych |

Konfiguracja zapisywana w `localStorage` pod kluczem `magazyn_config_v1`.

## Architecture

```
src/
├── lib/parser/          # Pure parsing engine (reads ParserConfig)
├── lib/data/            # Default config seed
├── lib/storage/         # configStorage + inventoryStorage
├── context/             # ConfigProvider + InventoryProvider
├── components/
│   ├── smart-paste/
│   ├── inventory/
│   └── settings/        # Admin panel tabs
└── hooks/
```

## Demo

Click **Demo** in Smart Paste to load the example Messenger message.

# Magazyn Główny — Smart Paste

Standalone inventory management app for restaurant warehouse staff. Paste raw Messenger inventory counts and the parser automatically maps them to SKUs, categories, and standard units.

## Stack

- **Vite + React 19 + TypeScript** — fast, typed, easy to extend
- **Tailwind CSS v4** — modern dark UI tuned for warehouse use
- **localStorage** — no backend required; data persists in the browser

## Features

| Module | Description |
|--------|-------------|
| **Smart Paste** | Paste Messenger text → auto-parse zones, quantities, aliases |
| **Category State Machine** | Headers like `zamrażalnik` / `lodówka` set the active zone |
| **Alias Dictionary** | Longest-match + fuzzy fallback for typos and shorthand |
| **Strict UOM** | All units normalized to `kg.`, `szt.`, or `opak.` |
| **Quarantine** | Unrecognized lines stay visible with one-click SKU assignment |
| **Manual Controls** | +/- qty, add SKU, reset database |

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm test
npm run preview
```

## Architecture

```
src/
├── lib/parser/          # Pure parsing engine (testable, no React)
│   ├── categoryStateMachine.ts
│   ├── quantityExtractor.ts
│   ├── uomNormalizer.ts
│   ├── aliasMatcher.ts
│   └── parseMessenger.ts
├── lib/data/            # SKU catalog, aliases, defaults
├── components/
│   ├── smart-paste/     # Paste panel, logs, quarantine
│   └── inventory/       # Category grid, item cards
└── hooks/useInventory.tsx
```

## Demo

Click **Demo** in the Smart Paste panel to load the example Messenger message from the spec.

# Magazyn Główny — Inventory Management

Restaurant warehouse inventory app with **Smart Paste**: paste raw Messenger count messages and automatically parse zones, SKUs, and standardized units.

## Quick start

```bash
cd inventory-app
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Parser unit tests |
| `npm run preview` | Preview production build |

## Architecture

```
src/
├── lib/parser/          # Category state machine, line regex, alias index, UOM
├── lib/dictionary/      # Categories, default SKUs, alias phrases
├── hooks/useInventory.ts
└── components/          # Smart Paste, Quarantine, Inventory grid
```

### Parser pipeline

1. **Meta filter** — skip warehouse header lines and timestamps
2. **Category state machine** — `zamrażalnik`, `lodówka`, `opakowania` set the active zone until the next header
3. **Line extraction** — quantity + optional unit + product name (`4x`, `3 kg`, `50 opakowań`, bare names → 1 szt.)
4. **Alias matcher** — longest-phrase-first index prevents greedy matches (e.g. `ser mozzarella` vs `ser`)
5. **SKU lookup** — update inventory quantities; unknown lines → **Quarantine**

### Standard units (UOM)

All raw units map strictly to: **kg.**, **szt.**, **opak.**

## Legacy prototype

The original single-file prototype is preserved as `index.html` at the repository root.

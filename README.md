# Magazyn Główny — Smart Paste

Standalone inventory management app for restaurant warehouse staff.

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja: **http://localhost:5173**

## Synchronizacja chmurowa (Supabase)

1. Utwórz projekt na [supabase.com](https://supabase.com)
2. W **SQL Editor** uruchom plik `supabase/schema.sql`
3. Skopiuj `.env.example` → `.env.local` i uzupełnij klucze API
4. Zrestartuj `npm run dev`
5. W aplikacji: **Ustawienia → Chmura** → ustaw wspólny **kod magazynu**

Funkcje:
- **Auto-sync** — każda zmiana wysyłana do chmury po 2 s
- **Realtime** — zmiany innych urządzeń bez odświeżania
- **Ręczny push/pull** — przyciski w zakładce Chmura

## Panel Ustawień

| Zakładka | Opis |
|----------|------|
| Strefy | Kategorie magazynowe + aliasy nagłówków |
| Produkty | Katalog SKU |
| Aliasy | Słownik nazw z Messengera |
| Jednostki | Mapowanie j.m. |
| Parser | Słowa ignorowane, fuzzy match |
| **Chmura** | Sync Supabase |
| Backup | Import/eksport JSON |

## Komendy

```bash
npm run dev
npm run build
npm test
```

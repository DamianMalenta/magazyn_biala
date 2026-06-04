-- Magazyn Główny — schema synchronizacji chmurowej (Supabase)
-- Uruchom w Supabase Dashboard → SQL Editor

create table if not exists warehouse_sync (
  sync_key text primary key,
  inventory jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists warehouse_sync_updated_at_idx on warehouse_sync (updated_at desc);

alter table warehouse_sync enable row level security;

-- Model współdzielonego kodu magazynu: każdy z kodem może czytać/zapisywać.
-- Dla produkcji rozważ Supabase Auth + polityki per użytkownik.
create policy "warehouse_sync_anon_all"
  on warehouse_sync
  for all
  to anon
  using (true)
  with check (true);

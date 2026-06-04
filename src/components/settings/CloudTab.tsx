import { useState } from 'react'
import { useCloudSync } from '../../hooks/useCloudSync'
import { SettingsSection, FieldLabel, TextInput, BtnPrimary } from './shared'

export function CloudTab() {
  const {
    prefs,
    status,
    statusMessage,
    isConfigured,
    setSyncKey,
    setAutoSync,
    pushNow,
    pullNow,
  } = useCloudSync()
  const [keyDraft, setKeyDraft] = useState(prefs.syncKey ?? '')
  const [busy, setBusy] = useState(false)

  const statusColor: Record<string, string> = {
    idle: 'text-slate-400',
    syncing: 'text-sky-400',
    synced: 'text-emerald-400',
    error: 'text-rose-400',
    offline: 'text-amber-400',
    not_configured: 'text-amber-400',
  }

  const run = async (action: 'push' | 'pull') => {
    setBusy(true)
    if (action === 'push') await pushNow()
    else await pullNow()
    setBusy(false)
  }

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-sm text-amber-200 space-y-2">
          <p className="font-bold">Supabase nie jest skonfigurowany</p>
          <p className="text-xs text-amber-300/80">
            Skopiuj <code className="font-mono">.env.example</code> → <code className="font-mono">.env.local</code>,
            uzupełnij <code className="font-mono">VITE_SUPABASE_URL</code> i{' '}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>, uruchom{' '}
            <code className="font-mono">supabase/schema.sql</code> w panelu Supabase, potem zrestartuj serwer dev.
          </p>
        </div>
      )}

      <SettingsSection
        title="Synchronizacja chmurowa"
        description="Wspólny kod magazynu dla całego zespołu. Zmiany wysyłane do Supabase i pobierane automatycznie (realtime + auto-sync)."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Kod magazynu (współdzielony)</FieldLabel>
            <TextInput
              value={keyDraft}
              onChange={setKeyDraft}
              placeholder="np. magazyn-biala-2026"
            />
            <BtnPrimary
              variant="sky"
              onClick={() => setSyncKey(keyDraft)}
              disabled={!keyDraft.trim()}
            >
              Zapisz kod
            </BtnPrimary>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="h-4 w-4 accent-violet-500"
              />
              <span className="text-sm text-slate-300">Auto-sync po każdej zmianie</span>
            </label>

            <div className={`text-sm font-semibold ${statusColor[status] ?? 'text-slate-400'}`}>
              Status: {status}
            </div>
            {statusMessage && (
              <p className="text-xs text-slate-500">{statusMessage}</p>
            )}
            {prefs.lastSyncedAt && (
              <p className="text-[10px] text-slate-600 font-mono">
                Ostatnia sync: {new Date(prefs.lastSyncedAt).toLocaleString('pl-PL')}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <BtnPrimary disabled={busy} onClick={() => run('push')}>
            Wyślij do chmury
          </BtnPrimary>
          <BtnPrimary variant="emerald" disabled={busy} onClick={() => run('pull')}>
            Pobierz z chmury
          </BtnPrimary>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Jak to działa"
        description="Instrukcja dla zespołu"
      >
        <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
          <li>Manager tworzy projekt Supabase i uruchamia schema SQL (jednorazowo).</li>
          <li>Wszyscy wpisują ten sam <strong className="text-slate-200">kod magazynu</strong>.</li>
          <li>Po Smart Paste lub edycji w ustawieniach — dane lecą do chmury automatycznie.</li>
          <li>Drugi manager/telefon — otwiera appkę, ten sam kod → pobiera aktualny stan.</li>
          <li>Realtime: zmiany innej osoby pojawiają się bez odświeżania strony.</li>
        </ol>
      </SettingsSection>
    </div>
  )
}

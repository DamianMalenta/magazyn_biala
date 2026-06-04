import { useCloudSync } from '../../hooks/useCloudSync'

export function CloudStatusBadge() {
  const { status, statusMessage, prefs, isConfigured } = useCloudSync()

  if (!isConfigured) {
    return (
      <span className="hidden sm:inline text-[10px] text-amber-500/80 font-mono" title="Skonfiguruj Supabase">
        chmura: brak .env
      </span>
    )
  }

  const colors: Record<string, string> = {
    syncing: 'text-sky-400 border-sky-500/30 bg-sky-950/30',
    synced: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
    error: 'text-rose-400 border-rose-500/30 bg-rose-950/30',
    idle: 'text-slate-500 border-slate-700 bg-slate-900/50',
    not_configured: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
    offline: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
  }

  const label =
    status === 'syncing'
      ? '☁️ sync…'
      : status === 'synced'
        ? '☁️ OK'
        : status === 'error'
          ? '☁️ błąd'
          : prefs.syncKey
            ? '☁️ gotowy'
            : '☁️ brak kodu'

  return (
    <span
      className={`hidden sm:inline text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${colors[status] ?? colors.idle}`}
      title={statusMessage ?? undefined}
    >
      {label}
    </span>
  )
}

import type { ParseLogEntry } from '../../types/inventory'

const LOG_STYLES: Record<ParseLogEntry['type'], string> = {
  meta: 'text-slate-500',
  category: 'text-sky-400 font-semibold',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-rose-400',
}

interface ParseLogProps {
  entries: ParseLogEntry[]
}

export function ParseLog({ entries }: ParseLogProps) {
  if (entries.length === 0) {
    return (
      <p className="text-xs text-slate-600 font-mono">
        Logi parsowania pojawią się tutaj po przetworzeniu wiadomości.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-thin font-mono text-xs">
      {entries.map((entry) => (
        <div key={entry.id} className={LOG_STYLES[entry.type]}>
          {entry.message}
        </div>
      ))}
    </div>
  )
}

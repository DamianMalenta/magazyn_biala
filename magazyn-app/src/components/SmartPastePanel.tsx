import { useState } from 'react'
import { parseMessengerText } from '../lib/parser'
import type {
  Category,
  InventoryItem,
  ParseLogEntry,
  QuarantineItem,
  StandardUnit,
} from '../lib/types'
import { Button } from './ui/Button'

const LOG_STYLES: Record<ParseLogEntry['type'], string> = {
  skip: 'text-zinc-600',
  category: 'text-blue-400 font-bold',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
}

interface SmartPastePanelProps {
  inventory: InventoryItem[]
  onParseComplete: (
    mutated: InventoryItem[],
    quarantine: QuarantineItem[]
  ) => void
  onResolveQuarantine: (
    item: QuarantineItem,
    action: 'add' | 'dismiss'
  ) => void
}

export function SmartPastePanel({
  inventory,
  onParseComplete,
  onResolveQuarantine,
}: SmartPastePanelProps) {
  const [text, setText] = useState('')
  const [logs, setLogs] = useState<ParseLogEntry[]>([])
  const [quarantine, setQuarantine] = useState<QuarantineItem[]>([])

  const runParse = () => {
    if (!text.trim()) return
    const working = structuredClone(inventory)
    const result = parseMessengerText(text, working)
    setLogs(result.logs)
    setQuarantine(result.quarantine)
    onParseComplete(working, result.quarantine)
    setText('')
  }

  const dismiss = (id: string) => {
    const item = quarantine.find((q) => q.id === id)
    if (item) onResolveQuarantine(item, 'dismiss')
    setQuarantine((q) => q.filter((x) => x.id !== id))
  }

  const assign = (item: QuarantineItem) => {
    onResolveQuarantine(item, 'add')
    setQuarantine((q) => q.filter((x) => x.id !== item.id))
  }

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl lg:w-[min(100%,22rem)] xl:w-80">
      <div className="border-b border-zinc-800 p-4">
        <h2 className="text-lg font-black uppercase text-emerald-400">
          Smart Paste
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Wklej całą wiadomość z Messengera. System ustawi strefę, zmapuje aliasy
          i jednostki (kg., szt., opak.).
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wklej tekst tutaj…"
          className="min-h-[180px] flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <Button variant="success" className="mt-3 w-full" onClick={runParse}>
          Przetwórz tekst
        </Button>

        {logs.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto hide-scrollbar">
            <p className="mb-2 text-[10px] font-bold uppercase text-zinc-500">
              Log parsowania
            </p>
            <div className="flex flex-col gap-0.5 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className={LOG_STYLES[log.type]}>
                  {log.type === 'success' && '✔ '}
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {quarantine.length > 0 && (
          <div className="mt-4 border-t border-red-500/30 pt-4">
            <h3 className="mb-2 text-sm font-black uppercase text-red-400">
              Kwarantanna ({quarantine.length})
            </h3>
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto hide-scrollbar">
              {quarantine.map((item) => (
                <QuarantineCard
                  key={item.id}
                  item={item}
                  onAssign={() => assign(item)}
                  onDismiss={() => dismiss(item.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

function QuarantineCard({
  item,
  onAssign,
  onDismiss,
}: {
  item: QuarantineItem
  onAssign: () => void
  onDismiss: () => void
}) {
  return (
    <div className="rounded-xl border border-red-500/50 bg-red-950/30 p-3">
      <p className="text-sm font-bold text-red-100">{item.rawName}</p>
      <p className="mt-0.5 font-mono text-xs text-zinc-400">
        {item.qty} {item.unit} · strefa: {item.suggestedCategory}
      </p>
      {item.suggestedName && (
        <p className="mt-1 text-[10px] text-amber-400/90">
          Sugestia: {item.suggestedName}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onAssign}
          className="flex-1 rounded-lg bg-red-600 py-2 text-[10px] font-black uppercase text-white hover:bg-red-500"
        >
          Dodaj do bazy (1 klik)
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-zinc-600 px-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-800"
        >
          Odrzuć
        </button>
      </div>
    </div>
  )
}

export type { QuarantineItem, Category, StandardUnit }

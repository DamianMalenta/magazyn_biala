import { useEffect, useState } from 'react'
import { parseMessengerText } from '../../lib/parser'
import { useInventory } from '../../hooks/useInventory'
import type { ParseLogEntry, QuarantineItem } from '../../types/inventory'
import { ParseLog } from './ParseLog'
import { QuarantineZone, type ResolvePayload } from './QuarantineZone'
import { MessengerTemplate } from './MessengerTemplate'

const EXAMPLE_TEXT = `Magazyn biala 04.06 14:00
zamrażalnik 
4x nugetsy 
5x skrzydełka
2x szyszki
1x papryka worek
poledwiczki surowe worek
1 pojemnik krewetek 
3 kg frytki
lodówka 
2x jogurt grecki
2 kg ser mozzarella
7x salami zwykle
1x sos czosnkowy
opakowania
10x kartony małe
50 opakowań na makarony
20 x wieczka na makarony
1 sztućce (łyżka i nóż)`

const RENAMENT_OPEN_KEY = 'magazyn-renament-expanded'

interface SmartPastePanelProps {
  onOpenGuide?: () => void
}

export function SmartPastePanel({ onOpenGuide }: SmartPastePanelProps) {
  const { items, customAliases, applyBulkUpdates, setQty, addItem, addCustomAlias } =
    useInventory()
  const [text, setText] = useState('')
  const [logs, setLogs] = useState<ParseLogEntry[]>([])
  const [quarantine, setQuarantine] = useState<QuarantineItem[]>([])
  const [lastSummary, setLastSummary] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(() => {
    try {
      return sessionStorage.getItem(RENAMENT_OPEN_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(RENAMENT_OPEN_KEY, expanded ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [expanded])

  const toggleExpanded = () => setExpanded((v) => !v)

  const handleParse = () => {
    if (!text.trim()) return

    const result = parseMessengerText(text, items, customAliases)

    if (result.updates.size > 0) {
      applyBulkUpdates(result.updates)
    }

    setLogs(result.logs)
    setQuarantine(result.quarantine)

    const successCount = result.logs.filter(
      (l) => l.type === 'success' || l.type === 'warning',
    ).length
    const zones =
      result.touchedCategories.length > 0
        ? ` · Strefy: ${result.touchedCategories.join(', ')}`
        : ''
    setLastSummary(
      `Zaktualizowano ${result.updates.size} SKU · Kwarantanna: ${result.quarantine.length} · Wpisy: ${successCount}${zones}`,
    )

    if (result.quarantine.length > 0) {
      setExpanded(true)
    }

    if (result.quarantine.length === 0) {
      setText('')
    }
  }

  const handleResolve = (item: QuarantineItem, resolution: ResolvePayload) => {
    if (resolution.mode === 'assign-existing' && resolution.skuId) {
      setQty(resolution.skuId, item.qty)
      if (resolution.rememberAlias !== false) {
        addCustomAlias(resolution.skuId, item.rawName)
      }
    }

    if (resolution.mode === 'create-new' && resolution.name && resolution.category && resolution.unit) {
      addItem({
        name: resolution.name,
        category: resolution.category,
        unit: resolution.unit,
        qty: item.qty,
      })
    }

    setQuarantine((prev) => prev.filter((q) => q.id !== item.id))
    setLogs((prev) => [
      ...prev,
      {
        id: `log-resolved-${item.id}`,
        type: 'success',
        message: `✓ Rozwiązano kwarantannę: „${item.rawName}"`,
      },
    ])
  }

  const handleDismiss = (id: string) => {
    setQuarantine((prev) => prev.filter((q) => q.id !== id))
  }

  const needsAttention = quarantine.length > 0

  return (
    <section
      className={[
        'renament-panel rounded-2xl border overflow-hidden transition-shadow',
        expanded ? 'renament-panel-open border-emerald-500/25 shadow-lg shadow-emerald-950/20' : 'border-slate-800/80 bg-slate-900/40',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={toggleExpanded}
        className={[
          'w-full flex items-center gap-3 px-4 py-3.5 text-left transition',
          expanded ? 'bg-emerald-950/30 border-b border-emerald-500/15' : 'hover:bg-slate-800/50',
        ].join(' ')}
        aria-expanded={expanded}
      >
        <span
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg',
            expanded ? 'bg-emerald-500/20' : 'bg-slate-800',
          ].join(' ')}
          aria-hidden
        >
          📋
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-white">Renament z Messengera</h2>
            {needsAttention && (
              <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                Kwarantanna: {quarantine.length}
              </span>
            )}
            {!expanded && lastSummary && !needsAttention && (
              <span className="text-[10px] text-emerald-400/80 truncate max-w-[14rem]">
                Ostatnio: {lastSummary.split('·')[0]?.trim()}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {expanded
              ? 'Wklej wiadomość i kliknij „Przetwórz” — do codziennej pracy używaj listy stanów poniżej'
              : 'Rozwiń tylko przy aktualizacji z grupy — na co dzień ustawiaj stany na kartach produktów'}
          </p>
        </div>

        <span
          className={[
            'shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
            expanded
              ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
              : 'border-slate-700 text-slate-400 bg-slate-900/80',
          ].join(' ')}
        >
          {expanded ? 'Zwiń ▴' : 'Rozwiń ▾'}
        </span>
      </button>

      {expanded && (
        <div className="p-4 flex flex-col gap-4 max-h-[min(70vh,640px)] overflow-y-auto scrollbar-thin bg-slate-950/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              Smart Paste — automatyczne rozpoznawanie stref i ilości z wiadomości.
            </p>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                Instrukcja krok po kroku →
              </button>
            )}
          </div>

          <MessengerTemplate />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wklej tutaj tekst renamentu z Messengera…"
            spellCheck={false}
            className="min-h-[140px] w-full resize-y rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm font-mono leading-relaxed outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleParse}
              disabled={!text.trim()}
              className="flex-1 min-w-[10rem] rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase text-sm py-3 transition active:scale-[0.98] shadow-lg shadow-emerald-900/30"
            >
              Przetwórz tekst
            </button>
            <button
              type="button"
              onClick={() => setText(EXAMPLE_TEXT)}
              className="rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-semibold px-4 py-3 transition"
              title="Wstaw przykład"
            >
              Demo
            </button>
          </div>

          {lastSummary && (
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-200/90">
              {lastSummary}
            </div>
          )}

          <ParseLog entries={logs} />

          <QuarantineZone
            items={quarantine}
            inventory={items}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
        </div>
      )}
    </section>
  )
}

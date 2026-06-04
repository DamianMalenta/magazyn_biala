import { useState } from 'react'
import { parseMessengerText } from '../../lib/parser'
import { useInventory } from '../../hooks/useInventory'
import type { ParseLogEntry, QuarantineItem } from '../../types/inventory'
import { ParseLog } from './ParseLog'
import { QuarantineZone, type ResolvePayload } from './QuarantineZone'

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

export function SmartPastePanel() {
  const { items, customAliases, applyBulkUpdates, setQty, addItem, addCustomAlias } =
    useInventory()
  const [text, setText] = useState('')
  const [logs, setLogs] = useState<ParseLogEntry[]>([])
  const [quarantine, setQuarantine] = useState<QuarantineItem[]>([])
  const [lastSummary, setLastSummary] = useState<string | null>(null)

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

  return (
    <aside className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
      <header className="px-4 pt-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <div>
            <h2 className="text-base font-bold text-emerald-400">Smart Paste</h2>
            <p className="text-[11px] text-slate-500">Wklej wiadomość z Messengera</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wklej tekst inwentaryzacji..."
          spellCheck={false}
          className="min-h-[180px] w-full resize-y rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm font-mono leading-relaxed outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleParse}
            disabled={!text.trim()}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase text-sm py-3 transition active:scale-[0.98] shadow-lg shadow-emerald-900/30"
          >
            Przetwórz tekst
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLE_TEXT)}
            className="rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-semibold px-3 transition"
            title="Wstaw przykład"
          >
            Demo
          </button>
        </div>

        {lastSummary && (
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-2 text-xs text-slate-400">
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
    </aside>
  )
}

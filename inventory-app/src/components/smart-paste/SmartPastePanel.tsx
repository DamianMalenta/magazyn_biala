import { useState } from 'react'
import { ClipboardPaste, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { QuarantineList } from '@/components/quarantine/QuarantineList'
import type { InventoryItem, ParseResult } from '@/types/inventory'
import { cn } from '@/lib/utils'

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

interface SmartPastePanelProps {
  inventory: InventoryItem[]
  lastParse: ParseResult | null
  onParse: (text: string) => ParseResult
  onResolveQuarantine: (
    skuId: string,
    rawName: string,
    qty: number,
    rememberAlias: boolean,
  ) => void
  onClearParse: () => void
}

export function SmartPastePanel({
  inventory,
  lastParse,
  onParse,
  onResolveQuarantine,
  onClearParse,
}: SmartPastePanelProps) {
  const [text, setText] = useState('')

  const handleParse = () => {
    if (!text.trim()) return
    onParse(text)
    setText('')
  }

  const loadExample = () => setText(EXAMPLE_TEXT)

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-xl lg:w-[360px] xl:w-[400px]">
      <div className="border-b border-[var(--color-border)] p-4">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-black uppercase text-emerald-400">
            Smart Paste
          </h2>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Wklej wiadomość z Messengera. Parser rozpozna strefy, aliasy i jednostki
          (kg., szt., opak.).
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 hide-scrollbar">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wklej tekst z grupy Messenger..."
          className="min-h-[180px] w-full flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-xs leading-relaxed outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="success" onClick={handleParse} className="flex-1">
            <ClipboardPaste className="h-4 w-4" />
            Przetwórz
          </Button>
          <Button variant="ghost" size="sm" onClick={loadExample} className="sm:w-auto">
            Przykład
          </Button>
        </div>

        {lastParse && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{lastParse.updates.length} zaktualiz.</Badge>
              {lastParse.quarantine.length > 0 && (
                <Badge tone="danger">{lastParse.quarantine.length} kwarantanna</Badge>
              )}
            </div>

            <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 hide-scrollbar">
              <ul className="space-y-1 font-mono text-[11px]">
                {lastParse.logs.map((log, i) => (
                  <li
                    key={`${log.message}-${i}`}
                    className={cn(
                      log.type === 'category' && 'font-bold text-blue-400',
                      log.type === 'success' && 'text-emerald-400',
                      log.type === 'warning' && 'text-amber-400',
                      log.type === 'meta' && 'text-slate-500',
                    )}
                  >
                    {log.message}
                  </li>
                ))}
              </ul>
            </div>

            {lastParse.quarantine.length === 0 && (
              <button
                type="button"
                onClick={onClearParse}
                className="text-[10px] font-medium text-slate-500 underline hover:text-slate-300"
              >
                Wyczyść log
              </button>
            )}
          </div>
        )}

        {lastParse && lastParse.quarantine.length > 0 && (
          <QuarantineList
            items={lastParse.quarantine}
            inventory={inventory}
            onResolve={onResolveQuarantine}
          />
        )}
      </div>
    </aside>
  )
}

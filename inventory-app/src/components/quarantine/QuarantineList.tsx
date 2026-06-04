import { useState } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { InventoryItem, ParsedLineQuarantine } from '@/types/inventory'

interface QuarantineListProps {
  items: ParsedLineQuarantine[]
  inventory: InventoryItem[]
  onResolve: (
    skuId: string,
    rawName: string,
    qty: number,
    rememberAlias: boolean,
  ) => void
}

export function QuarantineList({ items, inventory, onResolve }: QuarantineListProps) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [remember, setRemember] = useState<Record<string, boolean>>({})
  const [resolved, setResolved] = useState<Set<string>>(new Set())

  const pending = items.filter((item) => !resolved.has(item.rawLine))

  if (pending.length === 0) return null

  return (
    <div className="rounded-xl border-2 border-dashed border-red-500/50 bg-red-950/30 p-3">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <h3 className="text-sm font-black uppercase text-red-400">
          Kwarantanna ({pending.length})
        </h3>
      </div>
      <p className="mb-3 text-[11px] text-red-200/80">
        Nierozpoznane pozycje — przypisz do SKU jednym kliknięciem. Opcjonalnie
        zapisz alias na przyszłość.
      </p>

      <ul className="flex flex-col gap-3">
        {pending.map((item) => {
          const skuId = selections[item.rawLine] ?? ''
          const zoneItems = inventory.filter((i) => i.category === item.suggestedCategory)
          const allOptions = skuId
            ? inventory
            : [...zoneItems, ...inventory.filter((i) => !zoneItems.includes(i))]

          return (
            <li
              key={item.rawLine}
              className="rounded-lg border border-red-600/40 bg-red-900/20 p-3"
            >
              <p className="text-sm font-bold text-red-100">{item.rawName}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {item.qty} {item.uom} · sugerowana strefa: {item.suggestedCategory}
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-500">
                „{item.rawLine}”
              </p>

              <select
                value={skuId}
                onChange={(e) =>
                  setSelections((s) => ({ ...s, [item.rawLine]: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-red-700/50 bg-[var(--color-surface)] px-2 py-2 text-xs font-semibold outline-none focus:border-red-400"
              >
                <option value="">— Wybierz SKU —</option>
                {allOptions.map((sku) => (
                  <option key={sku.id} value={sku.id}>
                    [{sku.category}] {sku.name}
                  </option>
                ))}
              </select>

              <label className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                <input
                  type="checkbox"
                  checked={remember[item.rawLine] ?? true}
                  onChange={(e) =>
                    setRemember((r) => ({ ...r, [item.rawLine]: e.target.checked }))
                  }
                  className="rounded border-slate-600"
                />
                Zapamiętaj alias „{item.rawName}”
              </label>

              <Button
                variant="danger"
                size="sm"
                className="mt-2 w-full"
                disabled={!skuId}
                onClick={() => {
                  onResolve(
                    skuId,
                    item.rawName,
                    item.qty,
                    remember[item.rawLine] ?? true,
                  )
                  setResolved((prev) => new Set(prev).add(item.rawLine))
                }}
              >
                <Check className="h-3 w-3" />
                Przypisz i zaktualizuj
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

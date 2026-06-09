import { useState } from 'react'
import type { InventoryItem, StandardUOM } from '../../types/inventory'
import { STANDARD_UOMS } from '../../types/inventory'
import { formatQty } from '../../lib/utils/text'

interface ItemCardProps {
  item: InventoryItem
  onIncrement: () => void
  onDecrement: () => void
  onSetQty: (qty: number) => void
  onSetUnit: (unit: StandardUOM) => void
  onDelete: () => void
  highlight?: boolean
}

const UOM_SHORT: Record<StandardUOM, string> = {
  'szt.': 'szt',
  'kg.': 'kg',
  'opak.': 'opak',
}

function parseQtyInput(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!normalized) return 0
  const value = Number.parseFloat(normalized)
  if (Number.isNaN(value)) return null
  return Math.max(0, value)
}

export function ItemCard({
  item,
  onIncrement,
  onDecrement,
  onSetQty,
  onSetUnit,
  onDelete,
  highlight,
}: ItemCardProps) {
  const [qtyDraft, setQtyDraft] = useState(() => formatQty(item.qty))
  const [prevQty, setPrevQty] = useState(item.qty)

  if (item.qty !== prevQty) {
    setPrevQty(item.qty)
    setQtyDraft(formatQty(item.qty))
  }

  const commitQty = () => {
    const parsed = parseQtyInput(qtyDraft)
    if (parsed === null) {
      setQtyDraft(formatQty(item.qty))
      return
    }
    onSetQty(parsed)
    setQtyDraft(formatQty(parsed))
  }

  return (
    <article
      className={[
        'group rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200',
        highlight
          ? 'border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/30'
          : 'border-slate-800 bg-slate-900/80 hover:border-slate-700',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{item.name}</h3>
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-600 hover:text-rose-400 transition p-1 -m-1"
          title="Usuń SKU"
          aria-label={`Usuń ${item.name}`}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="flex items-center justify-between gap-1 rounded-xl bg-slate-950 border border-slate-800 p-1.5">
        <QtyButton variant="minus" onClick={onDecrement} />

        <div className="flex flex-col items-center flex-1 min-w-0 px-1">
          <input
            type="text"
            inputMode="decimal"
            value={qtyDraft}
            onChange={(e) => setQtyDraft(e.target.value)}
            onBlur={commitQty}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            className="w-full max-w-[5.5rem] text-center text-2xl font-black tabular-nums text-white bg-transparent border-b border-slate-700 focus:border-emerald-500 outline-none py-0.5"
            aria-label={`Ilość: ${item.name}`}
          />
          <select
            value={item.unit}
            onChange={(e) => onSetUnit(e.target.value as StandardUOM)}
            className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 outline-none focus:border-emerald-500 cursor-pointer"
            aria-label={`Jednostka: ${item.name}`}
          >
            {STANDARD_UOMS.map((u) => (
              <option key={u} value={u}>
                {UOM_SHORT[u]}
              </option>
            ))}
          </select>
        </div>

        <QtyButton variant="plus" onClick={onIncrement} />
      </div>
    </article>
  )
}

function QtyButton({
  variant,
  onClick,
}: {
  variant: 'plus' | 'minus'
  onClick: () => void
}) {
  const isPlus = variant === 'plus'
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'shrink-0 flex h-11 w-11 items-center justify-center rounded-lg text-xl font-black text-white transition active:scale-95',
        isPlus ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500',
      ].join(' ')}
      aria-label={isPlus ? 'Zwiększ o 1' : 'Zmniejsz o 1'}
    >
      {isPlus ? '+' : '−'}
    </button>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

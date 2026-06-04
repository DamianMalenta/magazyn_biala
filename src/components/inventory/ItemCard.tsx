import type { InventoryItem } from '../../types/inventory'
import { formatQty } from '../../lib/utils/text'

interface ItemCardProps {
  item: InventoryItem
  onIncrement: () => void
  onDecrement: () => void
  onDelete: () => void
  highlight?: boolean
}

export function ItemCard({
  item,
  onIncrement,
  onDecrement,
  onDelete,
  highlight,
}: ItemCardProps) {
  const isZero = item.qty === 0

  return (
    <article
      className={[
        'group rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-200',
        highlight
          ? 'border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/30'
          : isZero
            ? 'border-rose-500/30 bg-rose-950/10'
            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{item.name}</h3>
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition p-1 -m-1"
          title="Usuń SKU"
          aria-label={`Usuń ${item.name}`}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-1.5">
        <QtyButton variant="minus" onClick={onDecrement} />
        <div className="flex flex-col items-center min-w-[4.5rem]">
          <span
            className={[
              'text-3xl font-black tabular-nums',
              isZero ? 'text-rose-400' : 'text-white',
            ].join(' ')}
          >
            {formatQty(item.qty)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {item.unit}
          </span>
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
        'flex h-11 w-11 items-center justify-center rounded-lg text-xl font-black text-white transition active:scale-95',
        isPlus ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500',
      ].join(' ')}
      aria-label={isPlus ? 'Zwiększ' : 'Zmniejsz'}
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

import { Minus, Plus, Trash2 } from 'lucide-react'
import type { InventoryItem } from '@/types/inventory'
import { cn } from '@/lib/utils'

interface InventoryCardProps {
  item: InventoryItem
  onDelta: (id: string, delta: number) => void
  onRemove: (id: string) => void
}

export function InventoryCard({ item, onDelta, onRemove }: InventoryCardProps) {
  const isZero = item.qty === 0

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border p-4 shadow-lg transition',
        isZero
          ? 'border-red-500/40 bg-red-950/20'
          : 'border-[var(--color-border)] bg-[var(--color-surface-raised)]',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-black uppercase leading-tight text-slate-100">
          {item.name}
        </h3>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Usunąć „${item.name}” z bazy?`)) onRemove(item.id)
          }}
          className="shrink-0 rounded p-1 text-slate-500 transition hover:bg-red-900/30 hover:text-red-400"
          aria-label="Usuń"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        <button
          type="button"
          onClick={() => onDelta(item.id, -1)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600/90 text-xl font-black text-white transition hover:bg-red-500 active:scale-95"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
          <span
            className={cn(
              'text-3xl font-black tabular-nums',
              isZero ? 'text-red-400' : 'text-white',
            )}
          >
            {item.qty}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {item.uom}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDelta(item.id, 1)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600/90 text-xl font-black text-white transition hover:bg-emerald-500 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}

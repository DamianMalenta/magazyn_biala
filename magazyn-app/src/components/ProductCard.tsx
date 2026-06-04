import type { InventoryItem } from '../lib/types'

interface ProductCardProps {
  item: InventoryItem
  onChangeQty: (id: string, delta: number) => void
  onDelete: (id: string) => void
}

export function ProductCard({ item, onChangeQty, onDelete }: ProductCardProps) {
  const isZero = item.qty === 0

  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 shadow-lg transition ${
        isZero
          ? 'border-red-500/40 bg-red-950/20'
          : 'border-zinc-700/80 bg-zinc-800/80'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3 className="text-lg font-extrabold uppercase leading-tight text-zinc-100">
          {item.name}
        </h3>
        <button
          type="button"
          onClick={() => {
            if (confirm('Usunąć trwale ten towar z systemu?')) onDelete(item.id)
          }}
          className="rounded-lg p-1 text-zinc-600 transition hover:bg-zinc-700 hover:text-red-400"
          title="Usuń SKU"
          aria-label={`Usuń ${item.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-700 bg-zinc-950 p-2">
        <button
          type="button"
          onClick={() => onChangeQty(item.id, -1)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-2xl font-black text-white transition hover:bg-red-500 active:scale-95"
          aria-label="Zmniejsz"
        >
          −
        </button>
        <div className="flex flex-col items-center">
          <span
            className={`text-3xl font-black tabular-nums ${isZero ? 'text-red-400' : 'text-white'}`}
          >
            {item.qty}
          </span>
          <span className="text-xs font-bold uppercase text-zinc-500">{item.unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onChangeQty(item.id, 1)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-2xl font-black text-white transition hover:bg-emerald-500 active:scale-95"
          aria-label="Zwiększ"
        >
          +
        </button>
      </div>
    </article>
  )
}

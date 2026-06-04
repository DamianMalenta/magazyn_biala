import { Minus, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { InventoryStore } from '@/hooks/useInventory';
import {
  CATEGORIES,
  CATEGORY_META,
  type InventoryItem,
} from '@/types/inventory';

interface InventoryGridProps {
  store: InventoryStore;
}

function ItemCard({
  item,
  onChangeQty,
  onDelete,
}: {
  item: InventoryItem;
  onChangeQty: (delta: number) => void;
  onDelete: () => void;
}) {
  const isZero = item.qty === 0;

  return (
    <article
      className={clsx(
        'group flex flex-col rounded-2xl border p-4 transition-all',
        isZero
          ? 'border-red-500/40 bg-red-950/20'
          : 'border-white/5 bg-surface-800/60 hover:border-white/10',
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3 className="text-sm font-black uppercase leading-tight tracking-wide text-gray-100">
          {item.name}
        </h3>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-gray-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          title="Usuń SKU"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between rounded-xl border border-white/5 bg-surface-900 p-2">
        <button
          type="button"
          onClick={() => onChangeQty(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600/90 text-white transition hover:bg-red-500 active:scale-95"
        >
          <Minus className="h-5 w-5" strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center px-2">
          <span
            className={clsx(
              'text-3xl font-black tabular-nums',
              isZero ? 'text-red-400' : 'text-white',
            )}
          >
            {item.qty}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {item.unit}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onChangeQty(1)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500 active:scale-95"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>
    </article>
  );
}

export function InventoryGrid({ store }: InventoryGridProps) {
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Usunąć trwale „${name}" z systemu?`)) {
      store.deleteItem(id);
    }
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-surface-900/50 p-4 shadow-inner">
      <div className="flex flex-col gap-10 pb-8">
        {CATEGORIES.map((category) => {
          const items = store.inventory.filter((i) => i.category === category);
          const meta = CATEGORY_META[category];

          return (
            <section key={category}>
              <div
                className={clsx(
                  'mb-4 flex items-center gap-3 border-b-2 pb-3',
                  meta.border,
                )}
              >
                <h2
                  className={clsx(
                    'text-lg font-black uppercase tracking-widest sm:text-xl',
                    meta.accent,
                  )}
                >
                  {meta.label}
                </h2>
                <span
                  className={clsx(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                    meta.bg,
                    meta.accent,
                  )}
                >
                  {items.length} SKU
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-sm font-medium text-gray-600">
                  Brak asortymentu w tej strefie.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onChangeQty={(delta) => store.changeQty(item.id, delta)}
                      onDelete={() => handleDelete(item.id, item.name)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

import type { InventoryItem, Category } from '../../types/inventory'
import { CATEGORY_META } from '../../lib/data/categoryMeta'
import { ItemCard } from './ItemCard'

interface CategorySectionProps {
  category: Category
  items: InventoryItem[]
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onDelete: (id: string) => void
}

export function CategorySection({
  category,
  items,
  onIncrement,
  onDecrement,
  onDelete,
}: CategorySectionProps) {
  const meta = CATEGORY_META[category]
  const zeroCount = items.filter((i) => i.qty === 0).length

  return (
    <section className={`rounded-2xl border ${meta.border} ${meta.bg} p-5`}>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <h2 className={`text-xl font-black tracking-wide ${meta.accent}`}>{category}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{items.length} SKU</span>
          {zeroCount > 0 && (
            <span className="text-rose-400 font-semibold">{zeroCount} brak</span>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-slate-600 italic">Brak asortymentu w tej strefie.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onIncrement={() => onIncrement(item.id)}
              onDecrement={() => onDecrement(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

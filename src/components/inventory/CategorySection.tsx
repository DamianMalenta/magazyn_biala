import type { InventoryItem, Category, StandardUOM } from '../../types/inventory'
import { CATEGORY_META } from '../../lib/data/categoryMeta'
import { ItemCard } from './ItemCard'

interface CategorySectionProps {
  category: Category
  items: InventoryItem[]
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onSetQty: (id: string, qty: number) => void
  onSetUnit: (id: string, unit: StandardUOM) => void
  onDelete: (id: string) => void
}

export function CategorySection({
  category,
  items,
  onIncrement,
  onDecrement,
  onSetQty,
  onSetUnit,
  onDelete,
}: CategorySectionProps) {
  const meta = CATEGORY_META[category]

  return (
    <section className={`rounded-2xl border ${meta.border} ${meta.bg} p-5`}>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <h2 className={`text-xl font-black tracking-wide ${meta.accent}`}>{category}</h2>
        </div>
        <span className="text-xs text-slate-500">{items.length} na stanie</span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onIncrement={() => onIncrement(item.id)}
              onDecrement={() => onDecrement(item.id)}
              onSetQty={(qty) => onSetQty(item.id, qty)}
              onSetUnit={(unit) => onSetUnit(item.id, unit)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
      </div>
    </section>
  )
}

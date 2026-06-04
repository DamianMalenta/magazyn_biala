import { CATEGORIES, type Category, type InventoryItem } from '@/types/inventory'
import { InventoryCard } from './InventoryCard'
import { cn } from '@/lib/utils'

const CATEGORY_STYLES: Record<
  Category,
  { border: string; title: string; dot: string }
> = {
  LODÓWKA: {
    border: 'border-blue-500/30',
    title: 'text-[var(--color-fridge)]',
    dot: 'bg-[var(--color-fridge)]',
  },
  ZAMRAŻARKA: {
    border: 'border-cyan-500/30',
    title: 'text-[var(--color-freezer)]',
    dot: 'bg-[var(--color-freezer)]',
  },
  OPAKOWANIA: {
    border: 'border-orange-500/30',
    title: 'text-[var(--color-packaging)]',
    dot: 'bg-[var(--color-packaging)]',
  },
}

interface InventoryGridProps {
  inventory: InventoryItem[]
  onDelta: (id: string, delta: number) => void
  onRemove: (id: string) => void
}

export function InventoryGrid({ inventory, onDelta, onRemove }: InventoryGridProps) {
  return (
    <div className="flex flex-col gap-10 pb-8">
      {CATEGORIES.map((category) => {
        const items = inventory.filter((i) => i.category === category)
        const style = CATEGORY_STYLES[category]

        return (
          <section
            key={category}
            className={cn('border-b-2 pb-8', style.border)}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', style.dot)} />
              <h2
                className={cn(
                  'text-xl font-black uppercase tracking-wider',
                  style.title,
                )}
              >
                {category}
              </h2>
              <span className="ml-2 text-xs font-medium text-slate-500">
                {items.length} SKU
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm font-medium text-slate-600">
                Brak asortymentu w tej strefie.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onDelta={onDelta}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

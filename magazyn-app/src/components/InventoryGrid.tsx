import { CATEGORIES, type Category, type InventoryItem } from '../lib/types'
import { ProductCard } from './ProductCard'

const ZONE_STYLES: Record<
  Category,
  { border: string; title: string; accent: string }
> = {
  LODÓWKA: {
    border: 'border-blue-500/30',
    title: 'text-blue-300',
    accent: 'bg-blue-500',
  },
  ZAMRAŻARKA: {
    border: 'border-cyan-500/30',
    title: 'text-cyan-300',
    accent: 'bg-cyan-500',
  },
  OPAKOWANIA: {
    border: 'border-orange-500/30',
    title: 'text-orange-300',
    accent: 'bg-orange-500',
  },
}

interface InventoryGridProps {
  items: InventoryItem[]
  onChangeQty: (id: string, delta: number) => void
  onDelete: (id: string) => void
}

export function InventoryGrid({ items, onChangeQty, onDelete }: InventoryGridProps) {
  return (
    <div className="flex flex-col gap-10 pb-8">
      {CATEGORIES.map((category) => {
        const zoneItems = items.filter((i) => i.category === category)
        const style = ZONE_STYLES[category]
        const zeroCount = zoneItems.filter((i) => i.qty === 0).length

        return (
          <section
            key={category}
            className={`border-b-2 pb-8 ${style.border}`}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${style.accent}`} />
              <h2 className={`text-2xl font-black tracking-wider ${style.title}`}>
                {category}
              </h2>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
                {zoneItems.length} SKU
                {zeroCount > 0 && ` · ${zeroCount} na zero`}
              </span>
            </div>

            {zoneItems.length === 0 ? (
              <p className="font-semibold text-zinc-600">Brak asortymentu w tej strefie.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {zoneItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onChangeQty={onChangeQty}
                    onDelete={onDelete}
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

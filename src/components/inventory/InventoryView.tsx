import { CATEGORIES } from '../../types/inventory'
import { useInventory } from '../../hooks/useInventory'
import { CategorySection } from './CategorySection'

export function InventoryView() {
  const { items, updateQty, deleteItem } = useInventory()

  const inStock = items.filter((item) => item.qty > 0)
  const totalQty = inStock.reduce((sum, item) => sum + item.qty, 0)
  const hiddenZeroCount = items.length - inStock.length

  const handleDelete = (id: string) => {
    if (window.confirm('Usunąć trwale ten SKU z systemu?')) {
      deleteItem(id)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap gap-4 text-sm">
        <Stat label="Na stanie (pozycje)" value={String(inStock.length)} />
        <Stat label="Suma szt./kg/opak." value={String(totalQty)} />
        {hiddenZeroCount > 0 && (
          <Stat label="Ukryte (stan 0)" value={String(hiddenZeroCount)} />
        )}
      </div>

      {inStock.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-sm text-slate-500">
          Brak towarów na stanie. Wklej aktualizację z Messengera lub dodaj pozycję ręcznie.
        </p>
      ) : (
        CATEGORIES.map((category) => {
          const categoryInStock = inStock.filter((i) => i.category === category)
          if (categoryInStock.length === 0) return null

          return (
            <CategorySection
              key={category}
              category={category}
              items={categoryInStock}
              onIncrement={(id) => updateQty(id, 1)}
              onDecrement={(id) => updateQty(id, -1)}
              onDelete={handleDelete}
            />
          )
        })
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className="text-lg font-black tabular-nums text-white">{value}</p>
    </div>
  )
}

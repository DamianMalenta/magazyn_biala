import { CATEGORIES } from '../../types/inventory'
import { useInventory } from '../../hooks/useInventory'
import { CategorySection } from './CategorySection'

export function InventoryView() {
  const { items, updateQty, deleteItem } = useInventory()
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
  const zeroItems = items.filter((i) => i.qty === 0).length

  const handleDelete = (id: string) => {
    if (window.confirm('Usunąć trwale ten SKU z systemu?')) {
      deleteItem(id)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap gap-4 text-sm">
        <Stat label="Pozycje" value={String(items.length)} />
        <Stat label="Suma szt./kg/opak." value={String(totalQty)} />
        <Stat
          label="Brak na stanie"
          value={String(zeroItems)}
          alert={zeroItems > 0}
        />
      </div>

      {CATEGORIES.map((category) => (
        <CategorySection
          key={category}
          category={category}
          items={items.filter((i) => i.category === category)}
          onIncrement={(id) => updateQty(id, 1)}
          onDecrement={(id) => updateQty(id, -1)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string
  value: string
  alert?: boolean
}) {
  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className={`text-lg font-black tabular-nums ${alert ? 'text-rose-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

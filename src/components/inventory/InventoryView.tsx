import { useState } from 'react'
import { CATEGORIES } from '../../types/inventory'
import { useInventory } from '../../hooks/useInventory'
import { CategorySection } from './CategorySection'

export function InventoryView() {
  const { items, highlightItemId, updateQty, setQty, setUnit, deleteItem } = useInventory()
  const [showZeroStock, setShowZeroStock] = useState(true)

  const inStock = items.filter((item) => item.qty > 0)
  const zeroStock = items.filter((item) => item.qty === 0)
  const totalQty = inStock.reduce((sum, item) => sum + item.qty, 0)

  const handleDelete = (id: string) => {
    if (window.confirm('Usunąć trwale ten SKU z systemu?')) {
      deleteItem(id)
    }
  }

  const sectionProps = {
    highlightItemId,
    onIncrement: (id: string) => updateQty(id, 1),
    onDecrement: (id: string) => updateQty(id, -1),
    onSetQty: setQty,
    onSetUnit: setUnit,
    onDelete: handleDelete,
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap gap-4 text-sm">
        <Stat label="Na stanie (pozycje)" value={String(inStock.length)} />
        <Stat label="Suma szt./kg/opak." value={String(totalQty)} />
        {zeroStock.length > 0 && (
          <Stat label="W bazie (stan 0)" value={String(zeroStock.length)} />
        )}
      </div>

      {inStock.length === 0 && zeroStock.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-sm text-slate-500">
          Brak produktów w bazie. Dodaj pierwszy SKU w formularzu u góry strony.
        </p>
      ) : (
        <>
          {inStock.length > 0 ? (
            <div className="flex flex-col gap-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400/90">
                Na stanie
              </h2>
              {CATEGORIES.map((category) => {
                const categoryInStock = inStock.filter((i) => i.category === category)
                if (categoryInStock.length === 0) return null
                return (
                  <CategorySection
                    key={category}
                    category={category}
                    items={categoryInStock}
                    countLabel="na stanie"
                    {...sectionProps}
                  />
                )
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-sm text-slate-500">
              Nic nie jest na stanie. Rozwiń sekcję „W bazie (stan 0)” i ustaw ilość przyciskiem + — bez
              renamentu z Messengera.
            </p>
          )}

          {zeroStock.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-800 pt-6">
              <button
                type="button"
                onClick={() => setShowZeroStock((v) => !v)}
                className="flex items-center justify-between gap-3 text-left group"
              >
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition">
                    W bazie (stan 0) — ustaw ilość ręcznie
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Produkty zapisane w systemie, np. Ser Mozzarella. Kliknij + na karcie — bez renamentu.
                  </p>
                </div>
                <span className="text-slate-500 text-lg shrink-0" aria-hidden>
                  {showZeroStock ? '▾' : '▸'}
                </span>
              </button>

              {showZeroStock &&
                CATEGORIES.map((category) => {
                  const categoryZero = zeroStock.filter((i) => i.category === category)
                  if (categoryZero.length === 0) return null
                  return (
                    <CategorySection
                      key={`zero-${category}`}
                      category={category}
                      items={categoryZero}
                      countLabel="w bazie"
                      {...sectionProps}
                    />
                  )
                })}
            </div>
          )}
        </>
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

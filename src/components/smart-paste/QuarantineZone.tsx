import { useState } from 'react'
import type { QuarantineItem, InventoryItem, StandardUOM, Category } from '../../types/inventory'
import { CATEGORIES, STANDARD_UOMS } from '../../types/inventory'
import { formatQty } from '../../lib/utils/text'

interface QuarantineZoneProps {
  items: QuarantineItem[]
  inventory: InventoryItem[]
  onResolve: (item: QuarantineItem, resolution: ResolvePayload) => void
  onDismiss: (id: string) => void
}

export interface ResolvePayload {
  mode: 'assign-existing' | 'create-new'
  skuId?: string
  name?: string
  category?: Category
  unit?: StandardUOM
  rememberAlias?: boolean
}

export function QuarantineZone({ items, inventory, onResolve, onDismiss }: QuarantineZoneProps) {
  if (items.length === 0) return null

  return (
    <section className="mt-5 pt-5 border-t border-rose-500/30">
      <header className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
          {items.length}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide text-rose-400">
          Kwarantanna
        </h3>
      </header>
      <p className="text-xs text-slate-500 mb-3">
        Pozycje nierozpoznane przez parser. Przypisz do istniejącego SKU jednym kliknięciem
        lub utwórz nowy produkt.
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <QuarantineCard
            key={item.id}
            item={item}
            inventory={inventory}
            onResolve={onResolve}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </section>
  )
}

function QuarantineCard({
  item,
  inventory,
  onResolve,
  onDismiss,
}: {
  item: QuarantineItem
  inventory: InventoryItem[]
  onResolve: (item: QuarantineItem, resolution: ResolvePayload) => void
  onDismiss: (id: string) => void
}) {
  const [selectedSku, setSelectedSku] = useState(item.suggestedSkuId ?? '')
  const [rememberAlias, setRememberAlias] = useState(true)
  const [newName, setNewName] = useState(item.rawName)
  const [newCategory, setNewCategory] = useState<Category>(item.suggestedCategory)
  const [newUnit, setNewUnit] = useState<StandardUOM>(item.unit)
  const [showCreate, setShowCreate] = useState(!item.suggestedSkuId)

  const zoneItems = inventory.filter((i) => i.category === item.suggestedCategory)
  const otherItems = inventory.filter((i) => !zoneItems.includes(i))
  const skuOptions = [...zoneItems, ...otherItems]

  const suggested = item.suggestedSkuId
    ? inventory.find((i) => i.id === item.suggestedSkuId)
    : null

  return (
    <article className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 space-y-3">
      <div>
        <p className="text-sm font-semibold text-rose-100">{item.rawName}</p>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          {formatQty(item.qty)} {item.unit} · sugerowana strefa: {item.suggestedCategory}
        </p>
        <p className="text-[10px] text-slate-600 font-mono mt-1 truncate" title={item.rawLine}>
          „{item.rawLine}"
        </p>
      </div>

      {!showCreate && suggested && (
        <button
          type="button"
          onClick={() =>
            onResolve(item, {
              mode: 'assign-existing',
              skuId: suggested.id,
              rememberAlias: true,
            })
          }
          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase py-2.5 px-3 transition active:scale-[0.98]"
        >
          Przypisz do „{suggested.name}" ({formatQty(item.qty)} {item.unit})
        </button>
      )}

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
          Przypisz do SKU
        </label>
        <div className="flex gap-2">
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">— wybierz SKU —</option>
            {skuOptions.map((sku) => (
              <option key={sku.id} value={sku.id}>
                [{sku.category}] {sku.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedSku}
            onClick={() =>
              onResolve(item, {
                mode: 'assign-existing',
                skuId: selectedSku,
                rememberAlias,
              })
            }
            className="rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 transition"
          >
            OK
          </button>
        </div>
        <label className="flex items-center gap-2 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={rememberAlias}
            onChange={(e) => setRememberAlias(e.target.checked)}
            className="rounded border-slate-600"
          />
          Zapamiętaj alias „{item.rawName}" na przyszłość
        </label>
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-2">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          {showCreate ? 'Ukryj formularz nowego SKU' : 'Utwórz nowy SKU'}
        </button>

        {showCreate && (
          <div className="grid grid-cols-1 gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nazwa SKU"
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Category)}
                className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-2 text-sm outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as StandardUOM)}
                className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-2 text-sm outline-none focus:border-amber-500"
              >
                {STANDARD_UOMS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={!newName.trim()}
              onClick={() =>
                onResolve(item, {
                  mode: 'create-new',
                  name: newName.trim(),
                  category: newCategory,
                  unit: newUnit,
                })
              }
              className="rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold uppercase py-2 transition"
            >
              Utwórz SKU i zaktualizuj stan
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="text-[10px] text-slate-600 hover:text-slate-400"
      >
        Odrzuć pozycję
      </button>
    </article>
  )
}

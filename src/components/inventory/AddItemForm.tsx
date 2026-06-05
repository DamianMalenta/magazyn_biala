import { useState } from 'react'
import type { Category, StandardUOM } from '../../types/inventory'
import { CATEGORIES, STANDARD_UOMS } from '../../types/inventory'
import type { AddItemResult } from '../../context/inventoryContext'
import { useInventory } from '../../hooks/useInventory'

function resultMessage(result: AddItemResult): { text: string; tone: 'ok' | 'info' } {
  switch (result.status) {
    case 'created':
      return { text: `Dodano „${result.name}” do bazy.`, tone: 'ok' }
    case 'exists':
      return {
        text: `„${result.name}” jest już w bazie (stan 0) — przewiń do sekcji poniżej i ustaw +/−.`,
        tone: 'info',
      }
    case 'updated':
      return {
        text: `„${result.name}” już było w bazie — dodano ${result.addedQty} do stanu.`,
        tone: 'ok',
      }
  }
}

export function AddItemForm() {
  const { addItem } = useInventory()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('LODÓWKA')
  const [unit, setUnit] = useState<StandardUOM>('kg.')
  const [qty, setQty] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; tone: 'ok' | 'info' } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Podaj nazwę produktu')
      setFeedback(null)
      return
    }

    const parsedQty = Number.parseFloat(qty.replace(',', '.'))
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      setError('Podaj poprawną ilość (0 lub więcej)')
      setFeedback(null)
      return
    }

    const result = addItem({
      name: trimmed,
      category,
      unit,
      qty: parsedQty,
    })

    setName('')
    setQty('1')
    setError(null)
    setFeedback(resultMessage(result))

    const target = document.getElementById(`sku-card-${result.id}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div className="flex flex-col gap-2 w-full lg:w-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-2 w-full lg:items-center"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500"
          aria-label="Strefa magazynowa"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
            setFeedback(null)
          }}
          placeholder="Nazwa produktu, np. Ser Mozzarella"
          className="flex-1 min-w-[12rem] rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm font-semibold outline-none focus:border-sky-500"
        />

        <input
          type="text"
          inputMode="decimal"
          value={qty}
          onChange={(e) => {
            setQty(e.target.value)
            setError(null)
          }}
          className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 w-20 text-center tabular-nums"
          aria-label="Ilość początkowa"
          title="Ilość początkowa"
        />

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as StandardUOM)}
          className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 w-24"
          aria-label="Jednostka miary"
        >
          {STANDARD_UOMS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase text-sm px-5 py-2.5 transition active:scale-[0.98] whitespace-nowrap"
        >
          Dodaj SKU
        </button>
      </form>

      {error && <p className="text-xs text-rose-400">{error}</p>}
      {feedback && (
        <p
          className={`text-xs font-medium ${feedback.tone === 'ok' ? 'text-emerald-400' : 'text-amber-300/90'}`}
          role="status"
        >
          {feedback.text}
        </p>
      )}
      <p className="text-[10px] text-slate-500 max-w-xl">
        Bez renamentu — ustaw też stan na karcie w sekcji „W bazie (stan 0)” poniżej.
      </p>
    </div>
  )
}

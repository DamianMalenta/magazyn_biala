import { useState } from 'react'
import type { Category, StandardUOM } from '../../types/inventory'
import { CATEGORIES, STANDARD_UOMS } from '../../types/inventory'
import { useInventory } from '../../hooks/useInventory'

export function AddItemForm() {
  const { addItem } = useInventory()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('OPAKOWANIA')
  const [unit, setUnit] = useState<StandardUOM>('szt.')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Podaj nazwę SKU')
      return
    }
    addItem({ name: trimmed, category, unit })
    setName('')
    setError(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto lg:items-center"
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
        }}
        placeholder="Nazwa nowego SKU..."
        className="flex-1 min-w-[12rem] rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm font-semibold outline-none focus:border-sky-500"
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

      {error && <p className="text-xs text-rose-400 lg:sr-only">{error}</p>}
    </form>
  )
}

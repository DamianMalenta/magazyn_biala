import { useState } from 'react'
import type { StandardUOM } from '../../types/inventory'
import { useConfig } from '../../hooks/useConfig'
import { useInventory } from '../../hooks/useInventory'

export function AddItemForm() {
  const { categoryNames, config, addAliasToSku } = useConfig()
  const { addItem } = useInventory()
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categoryNames[0] ?? '')
  const [unit, setUnit] = useState<StandardUOM>('szt.')
  const [error, setError] = useState<string | null>(null)

  const activeCategory = categoryNames.includes(category) ? category : (categoryNames[0] ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Podaj nazwę SKU')
      return
    }
    addItem({ name: trimmed, category: activeCategory, unit })
    if (!config.skuAliases[trimmed]) {
      addAliasToSku(trimmed, trimmed.toLowerCase())
    }
    setName('')
    setError(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto lg:items-center"
    >
      <select
        value={activeCategory}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500"
        aria-label="Strefa magazynowa"
      >
        {categoryNames.map((cat) => (
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
        {config.standardUoms.map((u) => (
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

import { useState } from 'react'
import { CATEGORIES, STANDARD_UNITS, type Category, type StandardUnit } from '../lib/types'
import { Button } from './ui/Button'
import { Select } from './ui/Select'

interface AddItemBarProps {
  onAdd: (name: string, category: Category, unit: StandardUnit) => void
}

export function AddItemBar({ onAdd }: AddItemBarProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('OPAKOWANIA')
  const [unit, setUnit] = useState<StandardUnit>('szt.')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      alert('Wymagana nazwa towaru.')
      return
    }
    onAdd(trimmed, category, unit)
    setName('')
  }

  return (
    <header className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
            Magazyn główny
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Inteligentny panel
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <Select
            label="Strefa"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="sm:w-40"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Nazwa SKU
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Nazwa nowego towaru…"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <Select
            label="Jednostka"
            value={unit}
            onChange={(e) => setUnit(e.target.value as StandardUnit)}
            className="w-28"
          >
            {STANDARD_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>

          <Button onClick={submit} className="sm:self-end">
            Dodaj SKU
          </Button>
        </div>
      </div>
    </header>
  )
}

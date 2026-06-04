import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CATEGORIES, STANDARD_UOMS, type Category, type StandardUom } from '@/types/inventory'

interface AddItemFormProps {
  onAdd: (name: string, category: Category, uom: StandardUom) => void
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('OPAKOWANIA')
  const [uom, setUom] = useState<StandardUom>('szt.')

  const submit = () => {
    if (!name.trim()) return
    onAdd(name, category, uom)
    setName('')
  }

  const selectClass =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40'

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
        className={selectClass}
        aria-label="Strefa"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Nazwa nowego SKU..."
        className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold outline-none placeholder:text-slate-500 focus:border-blue-500"
      />
      <select
        value={uom}
        onChange={(e) => setUom(e.target.value as StandardUom)}
        className={`${selectClass} w-full sm:w-28`}
        aria-label="Jednostka"
      >
        {STANDARD_UOMS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <Button onClick={submit} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Dodaj SKU
      </Button>
    </div>
  )
}

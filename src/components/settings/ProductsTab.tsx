import { useState } from 'react'
import type { StandardUOM } from '../../types/inventory'
import { useConfig } from '../../hooks/useConfig'
import { useInventory } from '../../hooks/useInventory'
import { SettingsSection, TextInput, BtnPrimary, BtnGhost } from './shared'

export function ProductsTab() {
  const { categoryNames, config, addAliasToSku, removeSkuAliases } = useConfig()
  const { items, addItem, updateItem, deleteItem } = useInventory()
  const [filter, setFilter] = useState('')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState(categoryNames[0] ?? '')
  const [newUnit, setNewUnit] = useState<StandardUOM>('szt.')

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addItem({ name, category: newCategory, unit: newUnit })
    if (!config.skuAliases[name]) {
      addAliasToSku(name, name.toLowerCase())
    }
    setNewName('')
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Katalog SKU"
        description="Pełna baza produktów. Zmiana nazwy automatycznie przenosi aliasy w słowniku."
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
          >
            {categoryNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <TextInput value={newName} onChange={setNewName} placeholder="Nazwa SKU" className="md:col-span-2" />
          <select
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value as StandardUOM)}
            className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
          >
            {config.standardUoms.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <BtnPrimary onClick={handleAdd}>Dodaj produkt</BtnPrimary>

        <TextInput value={filter} onChange={setFilter} placeholder="Szukaj SKU..." />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                <th className="pb-2 pr-3">Nazwa SKU</th>
                <th className="pb-2 pr-3">Strefa</th>
                <th className="pb-2 pr-3">J.m.</th>
                <th className="pb-2 pr-3">Aliasy</th>
                <th className="pb-2">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  categoryNames={categoryNames}
                  standardUoms={config.standardUoms}
                  aliasCount={config.skuAliases[item.name]?.length ?? 0}
                  onUpdate={(patch) => updateItem(item.id, patch)}
                  onDelete={() => {
                    if (window.confirm(`Usunąć „${item.name}"?`)) {
                      deleteItem(item.id)
                      removeSkuAliases(item.name)
                    }
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  )
}

function ProductRow({
  item,
  categoryNames,
  standardUoms,
  aliasCount,
  onUpdate,
  onDelete,
}: {
  item: { id: string; name: string; category: string; unit: StandardUOM }
  categoryNames: string[]
  standardUoms: StandardUOM[]
  aliasCount: number
  onUpdate: (patch: Partial<{ name: string; category: string; unit: StandardUOM }>) => void
  onDelete: () => void
}) {
  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-900/50">
      <td className="py-2 pr-3">
        <input
          value={item.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-transparent border-b border-transparent focus:border-violet-500 outline-none font-semibold"
        />
      </td>
      <td className="py-2 pr-3">
        <select
          value={item.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
        >
          {categoryNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3">
        <select
          value={item.unit}
          onChange={(e) => onUpdate({ unit: e.target.value as StandardUOM })}
          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs w-20"
        >
          {standardUoms.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3 text-slate-500 text-xs">{aliasCount} aliasów</td>
      <td className="py-2">
        <BtnGhost className="text-rose-500" onClick={onDelete}>
          Usuń
        </BtnGhost>
      </td>
    </tr>
  )
}

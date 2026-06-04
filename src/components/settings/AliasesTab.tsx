import { useState } from 'react'
import { useConfig } from '../../hooks/useConfig'
import { useInventory } from '../../hooks/useInventory'
import { SettingsSection, FieldLabel, TextInput, BtnPrimary, TagList } from './shared'

export function AliasesTab() {
  const { config, addAliasToSku, removeAliasFromSku, setSkuAliases } = useConfig()
  const { items } = useInventory()
  const [selectedSku, setSelectedSku] = useState(items[0]?.name ?? '')
  const [newAlias, setNewAlias] = useState('')
  const [bulkText, setBulkText] = useState('')

  const aliases = config.skuAliases[selectedSku] ?? []
  const skusWithoutAliases = items.filter((i) => !(config.skuAliases[i.name]?.length))

  return (
    <div className="space-y-6">
      {skusWithoutAliases.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
          ⚠ {skusWithoutAliases.length} SKU bez aliasów:{' '}
          {skusWithoutAliases.map((i) => i.name).join(', ')}
        </div>
      )}

      <SettingsSection
        title="Słownik aliasów"
        description="Potoczne nazwy z Messengera mapowane na sztywne SKU. Dłuższe aliasy mają pierwszeństwo."
      >
        <FieldLabel>Wybierz SKU</FieldLabel>
        <select
          value={selectedSku}
          onChange={(e) => setSelectedSku(e.target.value)}
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm mb-4"
        >
          {items.map((item) => (
            <option key={item.id} value={item.name}>
              [{item.category}] {item.name}
            </option>
          ))}
        </select>

        <FieldLabel>Aliasy dla „{selectedSku}"</FieldLabel>
        <TagList
          items={aliases}
          color="violet"
          onRemove={(alias) => removeAliasFromSku(selectedSku, alias)}
        />

        <div className="flex gap-2 mt-3">
          <TextInput
            value={newAlias}
            onChange={setNewAlias}
            placeholder="np. nugersy, pojemnik krewetek"
            className="flex-1"
          />
          <BtnPrimary
            onClick={() => {
              addAliasToSku(selectedSku, newAlias)
              setNewAlias('')
            }}
          >
            Dodaj
          </BtnPrimary>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4">
          <FieldLabel>Import wielu aliasów (jeden na linię)</FieldLabel>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={4}
            placeholder={'nugetsy\nnugersy\nnuggets'}
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm font-mono outline-none focus:border-violet-500"
          />
          <BtnPrimary
            variant="sky"
            onClick={() => {
              const lines = bulkText
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)
              if (lines.length === 0) return
              const merged = [...new Set([...aliases, ...lines])]
              setSkuAliases(selectedSku, merged)
              setBulkText('')
            }}
          >
            Zaimportuj aliasy
          </BtnPrimary>
        </div>
      </SettingsSection>
    </div>
  )
}

import { useState } from 'react'
import { useConfig } from '../../hooks/useConfig'
import { useInventory } from '../../hooks/useInventory'
import { THEME_PRESETS } from '../../lib/data/themePresets'
import {
  SettingsSection,
  FieldLabel,
  TextInput,
  BtnPrimary,
  BtnGhost,
  TagList,
} from './shared'

export function CategoriesTab() {
  const { config, addCategory, updateCategory, removeCategory } = useConfig()
  const { countByCategory } = useInventory()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [aliasDraft, setAliasDraft] = useState('')

  const handleAdd = () => {
    const name = newName.trim().toUpperCase()
    if (!name) return
    if (config.categories.some((c) => c.name === name)) return

    const preset = THEME_PRESETS[config.categories.length % THEME_PRESETS.length]
    addCategory({
      name,
      aliases: [name.toLowerCase()],
      theme: { label: name, ...preset },
    })
    setNewName('')
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Strefy magazynowe"
        description="Nagłówki rozpoznawane w wiadomości z Messengera. Każda strefa ma aliasy — np. „zamrażalnik” → ZAMRAŻARKA."
      >
        <div className="flex gap-2">
          <TextInput
            value={newName}
            onChange={setNewName}
            placeholder="Nazwa nowej strefy, np. SPIŻARNIA"
            className="flex-1"
          />
          <BtnPrimary onClick={handleAdd}>Dodaj strefę</BtnPrimary>
        </div>

        <div className="space-y-4">
          {config.categories.map((cat) => (
            <article
              key={cat.id}
              className={`rounded-xl border ${cat.theme.border} ${cat.theme.bg} p-4 space-y-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.theme.icon}</span>
                  <div>
                    <p className={`font-black text-lg ${cat.theme.accent}`}>{cat.name}</p>
                    <p className="text-xs text-slate-500">
                      {countByCategory(cat.name)} SKU · {cat.aliases.length} aliasów
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <BtnGhost onClick={() => setEditingId(editingId === cat.id ? null : cat.id)}>
                    {editingId === cat.id ? 'Zwiń' : 'Edytuj'}
                  </BtnGhost>
                  <BtnGhost
                    className="text-rose-500 hover:text-rose-400"
                    onClick={() => {
                      if (countByCategory(cat.name) > 0) {
                        alert(`Nie można usunąć — ${countByCategory(cat.name)} SKU w tej strefie.`)
                        return
                      }
                      if (window.confirm(`Usunąć strefę „${cat.name}"?`)) {
                        removeCategory(cat.id)
                      }
                    }}
                  >
                    Usuń
                  </BtnGhost>
                </div>
              </div>

              {editingId === cat.id && (
                <div className="border-t border-slate-800 pt-3 space-y-3">
                  <div>
                    <FieldLabel>Identyfikator strefy (nagłówek)</FieldLabel>
                    <TextInput
                      value={cat.name}
                      onChange={(v) =>
                        updateCategory(cat.id, { name: v.trim().toUpperCase() })
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel>Nazwa wyświetlana</FieldLabel>
                    <TextInput
                      value={cat.theme.label}
                      onChange={(v) =>
                        updateCategory(cat.id, { theme: { ...cat.theme, label: v } })
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel>Ikona (emoji)</FieldLabel>
                    <TextInput
                      value={cat.theme.icon}
                      onChange={(v) =>
                        updateCategory(cat.id, { theme: { ...cat.theme, icon: v } })
                      }
                      className="w-24"
                    />
                  </div>
                  <div>
                    <FieldLabel>Aliasy rozpoznawane w Messengerze</FieldLabel>
                    <TagList
                      items={cat.aliases}
                      color="violet"
                      onRemove={(alias) =>
                        updateCategory(cat.id, {
                          aliases: cat.aliases.filter((a) => a !== alias),
                        })
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <TextInput
                        value={aliasDraft}
                        onChange={setAliasDraft}
                        placeholder="np. zamrażalnik"
                        className="flex-1"
                      />
                      <BtnPrimary
                        variant="sky"
                        onClick={() => {
                          const a = aliasDraft.trim().toLowerCase()
                          if (!a || cat.aliases.includes(a)) return
                          updateCategory(cat.id, { aliases: [...cat.aliases, a] })
                          setAliasDraft('')
                        }}
                      >
                        Dodaj alias
                      </BtnPrimary>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </SettingsSection>
    </div>
  )
}

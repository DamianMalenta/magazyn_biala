import { useState } from 'react'
import { useConfig } from '../../hooks/useConfig'
import { SettingsSection, FieldLabel, TextInput, BtnPrimary, TagList } from './shared'

export function ParserTab() {
  const { config, addIgnoreKeyword, removeIgnoreKeyword, setFuzzyMatch } = useConfig()
  const [newKeyword, setNewKeyword] = useState('')

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Słowa ignorowane"
        description='Linie zawierające te słowa są pomijane (np. nagłówek „Magazyn biala 04.06").'
      >
        <TagList items={config.ignoreLineKeywords} onRemove={removeIgnoreKeyword} />
        <div className="flex gap-2 mt-2">
          <TextInput
            value={newKeyword}
            onChange={setNewKeyword}
            placeholder="np. magazyn"
            className="flex-1"
          />
          <BtnPrimary
            onClick={() => {
              addIgnoreKeyword(newKeyword)
              setNewKeyword('')
            }}
          >
            Dodaj
          </BtnPrimary>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Dopasowanie rozmyte (fuzzy match)"
        description="Łapie drobne literówki w nazwach produktów, gdy alias nie pasuje idealnie."
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.fuzzyMatchEnabled}
            onChange={(e) => setFuzzyMatch(e.target.checked)}
            className="h-4 w-4 rounded accent-violet-500"
          />
          <span className="text-sm text-slate-300">Włączone</span>
        </label>

        <div className="mt-3">
          <FieldLabel>Maks. odległość Levenshteina</FieldLabel>
          <input
            type="range"
            min={1}
            max={5}
            value={config.fuzzyMatchMaxDistance}
            disabled={!config.fuzzyMatchEnabled}
            onChange={(e) => setFuzzyMatch(true, Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Aktualnie: {config.fuzzyMatchMaxDistance} — im wyżej, tym bardziej „cierpliwy” parser
          </p>
        </div>
      </SettingsSection>
    </div>
  )
}

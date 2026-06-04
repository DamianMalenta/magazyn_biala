import { useState } from 'react'
import type { StandardUOM } from '../../types/inventory'
import { useConfig } from '../../hooks/useConfig'
import { SettingsSection, TextInput, BtnPrimary, TagList } from './shared'

export function UomTab() {
  const { config, setUomMapping, removeUomMapping, addRawUnitToken, removeRawUnitToken, setUnitAsProductName } =
    useConfig()
  const [newRaw, setNewRaw] = useState('')
  const [newStandard, setNewStandard] = useState<StandardUOM>('szt.')
  const [newToken, setNewToken] = useState('')
  const [newProductUnit, setNewProductUnit] = useState('')

  const mappings = Object.entries(config.uomMappings).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Mapowanie jednostek"
        description="Surowe skróty z Messengera → standardowe j.m.: kg., szt., opak."
      >
        <div className="grid grid-cols-3 gap-2">
          <TextInput value={newRaw} onChange={setNewRaw} placeholder="np. worek" />
          <select
            value={newStandard}
            onChange={(e) => setNewStandard(e.target.value as StandardUOM)}
            className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
          >
            {config.standardUoms.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <BtnPrimary onClick={() => { setUomMapping(newRaw, newStandard); setNewRaw('') }}>
            Dodaj mapowanie
          </BtnPrimary>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-800">
                <th className="pb-2">Surowa jednostka</th>
                <th className="pb-2">Standard</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {mappings.map(([raw, standard]) => (
                <tr key={raw} className="border-b border-slate-800/50">
                  <td className="py-1.5 font-mono text-slate-300">{raw}</td>
                  <td className="py-1.5">
                    <select
                      value={standard}
                      onChange={(e) => setUomMapping(raw, e.target.value as StandardUOM)}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs"
                    >
                      {config.standardUoms.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5">
                    <button
                      type="button"
                      onClick={() => removeUomMapping(raw)}
                      className="text-xs text-rose-500 hover:text-rose-400"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Tokeny jednostek w parserze"
        description="Słowa rozpoznawane w tekście i usuwane z nazwy produktu podczas parsowania."
      >
        <TagList items={config.rawUnitTokens} onRemove={removeRawUnitToken} />
        <div className="flex gap-2 mt-2">
          <TextInput value={newToken} onChange={setNewToken} placeholder="np. karton" className="flex-1" />
          <BtnPrimary variant="sky" onClick={() => { addRawUnitToken(newToken); setNewToken('') }}>
            Dodaj token
          </BtnPrimary>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Jednostki będące częścią nazwy produktu"
        description="Np. „opakowań na makarony” — słowo opakowań to nazwa, nie jednostka ilości."
      >
        <TagList
          items={config.unitAsProductName}
          color="amber"
          onRemove={(token) =>
            setUnitAsProductName(config.unitAsProductName.filter((t) => t !== token))
          }
        />
        <div className="flex gap-2 mt-2">
          <TextInput value={newProductUnit} onChange={setNewProductUnit} placeholder="np. opakowań" className="flex-1" />
          <BtnPrimary
            variant="sky"
            onClick={() => {
              const t = newProductUnit.trim().toLowerCase()
              if (!t || config.unitAsProductName.includes(t)) return
              setUnitAsProductName([...config.unitAsProductName, t])
              setNewProductUnit('')
            }}
          >
            Dodaj
          </BtnPrimary>
        </div>
      </SettingsSection>
    </div>
  )
}

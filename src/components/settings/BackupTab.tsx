import { useRef, useState } from 'react'
import { useConfig } from '../../hooks/useConfig'
import { useInventory } from '../../hooks/useInventory'
import { SettingsSection, BtnPrimary } from './shared'

import { STORAGE_KEY } from '../../lib/data/defaultInventory'

export function BackupTab() {
  const { config, importConfig, resetConfig, exportConfig } = useConfig()
  const { items, replaceAll, resetToDefaults } = useInventory()
  const [importText, setImportText] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportAll = () => {
    const bundle = {
      config,
      inventory: items,
      exportedAt: new Date().toISOString(),
    }
    downloadJson('magazyn-backup.json', bundle)
    setStatus('Wyeksportowano pełną kopię zapasową.')
  }

  const exportConfigOnly = () => {
    downloadJson('magazyn-config.json', JSON.parse(exportConfig()))
    setStatus('Wyeksportowano konfigurację parsera.')
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)
      if (parsed.config) {
        importConfig(JSON.stringify(parsed.config))
        if (parsed.inventory) replaceAll(parsed.inventory)
        setStatus('Zaimportowano pełną kopię.')
      } else {
        importConfig(importText)
        setStatus('Zaimportowano konfigurację.')
      }
      setImportText('')
    } catch {
      setStatus('Błąd: nieprawidłowy format JSON.')
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setImportText(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Kopia zapasowa"
        description="Eksportuj i importuj konfigurację parsera oraz stany magazynowe."
      >
        <div className="flex flex-wrap gap-2">
          <BtnPrimary onClick={exportAll}>Eksportuj wszystko</BtnPrimary>
          <BtnPrimary variant="sky" onClick={exportConfigOnly}>
            Eksportuj tylko konfigurację
          </BtnPrimary>
          <BtnPrimary
            variant="rose"
            onClick={() => {
              if (
                window.confirm(
                  'Przywrócić domyślną konfigurację i bazę SKU? Utrata niestandardowych ustawień.',
                )
              ) {
                resetConfig()
                resetToDefaults()
                setStatus('Przywrócono ustawienia domyślne.')
              }
            }}
          >
            Reset wszystkiego
          </BtnPrimary>
        </div>

        {status && (
          <p className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800 rounded-lg px-3 py-2">
            {status}
          </p>
        )}

        <div className="text-xs text-slate-500 font-mono space-y-1 pt-2 border-t border-slate-800">
          <p>SKU w magazynie: {items.length}</p>
          <p>Strefy: {config.categories.length}</p>
          <p>Aliasy: {Object.keys(config.skuAliases).length}</p>
          <p>Mapowania j.m.: {Object.keys(config.uomMappings).length}</p>
          <p>Klucz localStorage magazynu: {STORAGE_KEY}</p>
        </div>
      </SettingsSection>

      <SettingsSection title="Import JSON" description="Wklej plik kopii zapasowej lub samej konfiguracji.">
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        <BtnPrimary variant="sky" onClick={() => fileRef.current?.click()}>
          Wybierz plik .json
        </BtnPrimary>

        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={8}
          placeholder='{"config": {...}, "inventory": [...]}'
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-xs font-mono outline-none focus:border-violet-500"
        />
        <BtnPrimary onClick={handleImport} disabled={!importText.trim()}>
          Importuj
        </BtnPrimary>
      </SettingsSection>
    </div>
  )
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

import { useRef } from 'react'
import { AddItemForm } from '../inventory/AddItemForm'
import { useInventory } from '../../hooks/useInventory'

interface HeaderProps {
  compact?: boolean
}

export function Header({ compact = false }: HeaderProps) {
  const { resetToDefaults, exportBackup, importBackup } = useInventory()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    if (
      window.confirm(
        'Przywrócić domyślną bazę SKU? Spowoduje to utratę bieżących ilości, aliasów i niestandardowych produktów.',
      )
    ) {
      resetToDefaults()
      window.location.reload()
    }
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    const result = await importBackup(file)
    if (!result.ok) {
      alert(result.error)
      return
    }
    window.location.reload()
  }

  return (
    <header
      className={[
        'shrink-0 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-4 flex flex-col gap-4',
        compact ? '' : 'xl:flex-row xl:items-center xl:justify-between',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-xl">
          🏭
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Magazyn Główny</h1>
          <p className="text-xs text-slate-500">
            {compact ? 'Instrukcja dla pracowników' : 'Inteligentny panel inwentaryzacji'}
          </p>
        </div>
      </div>

      {!compact && (
        <>
          <AddItemForm />

          <div className="flex flex-wrap items-center gap-3 self-end xl:self-center">
            <button
              type="button"
              onClick={exportBackup}
              className="text-[10px] font-semibold uppercase text-slate-500 hover:text-emerald-400 transition"
            >
              Eksport JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-semibold uppercase text-slate-500 hover:text-emerald-400 transition"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                void handleImport(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] text-slate-600 hover:text-slate-400 underline whitespace-nowrap"
            >
              Reset bazy
            </button>
          </div>
        </>
      )}
    </header>
  )
}

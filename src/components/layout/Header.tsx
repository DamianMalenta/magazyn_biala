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
    <header className="magazyn-header shrink-0 w-full lg:max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl ring-1 ring-emerald-500/20">
          🏭
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Magazyn Główny</h1>
          <p className="text-xs text-slate-500">
            {compact ? 'Instrukcja dla pracowników' : 'Panel stanów · lodówka, zamrażarka, opakowania'}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-sm p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400/90">
            Dodaj produkt ręcznie
          </p>
          <AddItemForm />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-slate-800/80">
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
              className="text-[10px] text-slate-600 hover:text-slate-400 underline"
            >
              Reset bazy
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

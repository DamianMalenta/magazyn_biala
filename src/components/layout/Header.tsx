import { AddItemForm } from '../inventory/AddItemForm'
import { useInventory } from '../../hooks/useInventory'

export function Header() {
  const { resetToDefaults } = useInventory()

  const handleReset = () => {
    if (
      window.confirm(
        'Przywrócić domyślną bazę SKU? Spowoduje to utratę bieżących ilości i niestandardowych produktów.',
      )
    ) {
      resetToDefaults()
    }
  }

  return (
    <header className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-xl">
          🏭
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Magazyn Główny</h1>
          <p className="text-xs text-slate-500">Inteligentny panel inwentaryzacji</p>
        </div>
      </div>

      <AddItemForm />

      <button
        type="button"
        onClick={handleReset}
        className="text-[10px] text-slate-600 hover:text-slate-400 underline self-end xl:self-center whitespace-nowrap"
      >
        Reset bazy
      </button>
    </header>
  )
}

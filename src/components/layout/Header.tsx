import { AddItemForm } from '../inventory/AddItemForm'
import { Navigation, type AppView } from './Navigation'
import { CloudStatusBadge } from './CloudStatusBadge'

interface HeaderProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
}

export function Header({ activeView, onViewChange }: HeaderProps) {
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
        <CloudStatusBadge />
      </div>

      <Navigation active={activeView} onChange={onViewChange} />

      {activeView === 'warehouse' && <AddItemForm />}
    </header>
  )
}

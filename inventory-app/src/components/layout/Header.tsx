import { Package, Warehouse } from 'lucide-react'
import { AddItemForm } from '@/components/inventory/AddItemForm'
import type { Category, StandardUom } from '@/types/inventory'

interface HeaderProps {
  onAdd: (name: string, category: Category, uom: StandardUom) => void
}

export function Header({ onAdd }: HeaderProps) {
  return (
    <header className="shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              Magazyn Główny
            </h1>
            <p className="text-xs text-slate-400">Inteligentny panel magazynowy</p>
          </div>
        </div>
        <div className="ml-auto hidden items-center gap-2 text-slate-500 sm:flex">
          <Package className="h-4 w-4" />
          <span className="text-xs font-medium">Smart Paste · Alias · UOM</span>
        </div>
      </div>
      <AddItemForm onAdd={onAdd} />
    </header>
  )
}

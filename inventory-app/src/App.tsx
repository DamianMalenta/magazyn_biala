import { Header } from '@/components/layout/Header'
import { InventoryGrid } from '@/components/inventory/InventoryGrid'
import { SmartPastePanel } from '@/components/smart-paste/SmartPastePanel'
import { useInventory } from '@/hooks/useInventory'

export default function App() {
  const {
    inventory,
    lastParse,
    hydrated,
    updateQty,
    addItem,
    removeItem,
    applyParse,
    resolveQuarantine,
    setLastParse,
  } = useInventory()

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Ładowanie magazynu…
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-4 p-4 md:p-6">
      <Header
        onAdd={(name, category, uom) => {
          addItem(name, category, uom)
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <SmartPastePanel
          inventory={inventory}
          lastParse={lastParse}
          onParse={applyParse}
          onResolveQuarantine={resolveQuarantine}
          onClearParse={() => setLastParse(null)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 shadow-inner hide-scrollbar md:p-6">
          <InventoryGrid
            inventory={inventory}
            onDelta={updateQty}
            onRemove={removeItem}
          />
        </main>
      </div>
    </div>
  )
}

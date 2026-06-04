import { useCallback } from 'react'
import { AddItemBar } from './components/AddItemBar'
import { InventoryGrid } from './components/InventoryGrid'
import { SmartPastePanel } from './components/SmartPastePanel'
import type { QuarantineItem } from './lib/types'
import { useInventory } from './hooks/useInventory'
import { Button } from './components/ui/Button'

function App() {
  const {
    items,
    changeQty,
    removeItem,
    addItem,
    resetToDefault,
    applyParsedUpdates,
  } = useInventory()

  const handleParseComplete = useCallback(
    (mutated: typeof items, _quarantine: QuarantineItem[]) => {
      applyParsedUpdates(mutated)
    },
    [applyParsedUpdates]
  )

  const handleResolveQuarantine = useCallback(
    (item: QuarantineItem, action: 'add' | 'dismiss') => {
      if (action === 'add') {
        addItem(
          item.suggestedName ?? item.rawName,
          item.suggestedCategory,
          item.unit,
          item.qty
        )
      }
    },
    [addItem]
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <AddItemBar onAdd={(name, category, unit) => addItem(name, category, unit)} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <SmartPastePanel
          inventory={items}
          onParseComplete={handleParseComplete}
          onResolveQuarantine={handleResolveQuarantine}
        />

        <main className="hide-scrollbar min-h-0 flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 shadow-inner md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Stany magazynowe · jednostki: kg., szt., opak.
            </p>
            <Button variant="ghost" className="!py-2 !px-3 text-xs" onClick={resetToDefault}>
              Reset katalogu
            </Button>
          </div>
          <InventoryGrid
            items={items}
            onChangeQty={changeQty}
            onDelete={removeItem}
          />
        </main>
      </div>
    </div>
  )
}

export default App

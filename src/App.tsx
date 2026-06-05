import { useState } from 'react'
import { Header } from './components/layout/Header'
import { AppTabs, type AppTab } from './components/layout/AppTabs'
import { SmartPastePanel } from './components/smart-paste/SmartPastePanel'
import { InventoryView } from './components/inventory/InventoryView'
import { InstructionView } from './components/instruction/InstructionView'

export default function App() {
  const [tab, setTab] = useState<AppTab>('magazyn')

  return (
    <div className="magazyn-app min-h-screen flex flex-col">
      <div className="magazyn-mesh pointer-events-none" aria-hidden />

      <div className="relative z-10 flex flex-col flex-1 p-4 md:p-6 gap-4 max-w-[1680px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <Header compact={tab === 'instrukcja'} />
          <AppTabs active={tab} onChange={setTab} />
        </div>

        {tab === 'magazyn' ? (
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <SmartPastePanel onOpenGuide={() => setTab('instrukcja')} />

            <main className="magazyn-main flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              <div className="magazyn-main-inner">
                <div className="magazyn-main-head">
                  <h2 className="text-lg font-black text-white tracking-tight">Stany magazynowe</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ustaw ilości na kartach (+/−) lub dodaj nowy produkt u góry strony
                  </p>
                </div>
                <InventoryView />
              </div>
            </main>
          </div>
        ) : (
          <main className="magazyn-main flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 md:p-8">
            <InstructionView />
          </main>
        )}
      </div>
    </div>
  )
}

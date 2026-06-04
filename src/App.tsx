import { useState } from 'react'
import { Header } from './components/layout/Header'
import { AppTabs, type AppTab } from './components/layout/AppTabs'
import { SmartPastePanel } from './components/smart-paste/SmartPastePanel'
import { InventoryView } from './components/inventory/InventoryView'
import { InstructionView } from './components/instruction/InstructionView'

export default function App() {
  const [tab, setTab] = useState<AppTab>('magazyn')

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 gap-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Header compact={tab === 'instrukcja'} />
        <AppTabs active={tab} onChange={setTab} />
      </div>

      {tab === 'magazyn' ? (
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:max-h-[calc(100vh-10rem)] lg:sticky lg:top-6">
            <SmartPastePanel onOpenGuide={() => setTab('instrukcja')} />
          </div>

          <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:p-6">
            <InventoryView />
          </main>
        </div>
      ) : (
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:p-8">
          <InstructionView />
        </main>
      )}
    </div>
  )
}

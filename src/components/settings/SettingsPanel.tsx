import { useState } from 'react'
import { CategoriesTab } from './CategoriesTab'
import { ProductsTab } from './ProductsTab'
import { AliasesTab } from './AliasesTab'
import { UomTab } from './UomTab'
import { ParserTab } from './ParserTab'
import { BackupTab } from './BackupTab'
import { CloudTab } from './CloudTab'

const TABS = [
  { id: 'categories', label: 'Strefy', icon: '🗂️' },
  { id: 'products', label: 'Produkty', icon: '📦' },
  { id: 'aliases', label: 'Aliasy', icon: '🔗' },
  { id: 'uom', label: 'Jednostki', icon: '⚖️' },
  { id: 'parser', label: 'Parser', icon: '🧠' },
  { id: 'cloud', label: 'Chmura', icon: '☁️' },
  { id: 'backup', label: 'Backup', icon: '💾' },
] as const

type TabId = (typeof TABS)[number]['id']

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('cloud')

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-0 flex-1">
      <nav className="lg:w-52 shrink-0 flex lg:flex-col gap-1 overflow-x-auto scrollbar-thin pb-1 lg:pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition',
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800',
            ].join(' ')}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:p-6">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'aliases' && <AliasesTab />}
        {activeTab === 'uom' && <UomTab />}
        {activeTab === 'parser' && <ParserTab />}
        {activeTab === 'cloud' && <CloudTab />}
        {activeTab === 'backup' && <BackupTab />}
      </div>
    </div>
  )
}

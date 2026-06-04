export type AppTab = 'magazyn' | 'instrukcja'

interface AppTabsProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

const TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: 'magazyn', label: 'Magazyn', icon: '📦' },
  { id: 'instrukcja', label: 'Instrukcja', icon: '📖' },
]

export function AppTabs({ active, onChange }: AppTabsProps) {
  return (
    <nav
      className="flex gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-full sm:w-auto"
      aria-label="Nawigacja aplikacji"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition',
              isActive
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

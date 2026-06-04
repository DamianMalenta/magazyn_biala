export type AppView = 'warehouse' | 'settings'

interface NavigationProps {
  active: AppView
  onChange: (view: AppView) => void
}

export function Navigation({ active, onChange }: NavigationProps) {
  const tabs: { id: AppView; label: string; icon: string }[] = [
    { id: 'warehouse', label: 'Magazyn', icon: '🏭' },
    { id: 'settings', label: 'Ustawienia', icon: '⚙️' },
  ]

  return (
    <nav className="flex gap-1 rounded-xl bg-slate-950 border border-slate-800 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition',
            active === tab.id
              ? tab.id === 'settings'
                ? 'bg-violet-600 text-white'
                : 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white',
          ].join(' ')}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

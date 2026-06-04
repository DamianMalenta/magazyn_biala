interface SectionHeaderProps {
  icon: string
  title: string
  badge?: string
  badgeVariant?: 'amber' | 'emerald' | 'neutral'
}

export function SectionHeader({ icon, title, badge, badgeVariant = 'neutral' }: SectionHeaderProps) {
  const badgeCls = {
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    neutral: 'bg-white/5 text-slate-400 border-white/10',
  }[badgeVariant]

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-lg">
        {icon}
      </span>
      <h2 className="text-base font-bold tracking-tight text-white/95">{title}</h2>
      {badge && (
        <span className={`ml-auto text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeCls}`}>
          {badge}
        </span>
      )}
    </div>
  )
}

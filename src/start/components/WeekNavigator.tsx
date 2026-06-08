import { addWeeks, formatWeekLabel, getWeekKey, isCurrentWeek } from '../lib/weekCalendar'

interface WeekNavigatorProps {
  weekKey: string
  onWeekChange: (weekKey: string) => void
  className?: string
  showTodayButton?: boolean
}

export function WeekNavigator({ weekKey, onWeekChange, className = '', showTodayButton = true }: WeekNavigatorProps) {
  const isCurrent = isCurrentWeek(weekKey)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onWeekChange(addWeeks(weekKey, -1))}
        className="shrink-0 w-9 h-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-lg leading-none"
        title="Poprzedni tydzień"
        aria-label="Poprzedni tydzień"
      >
        ‹
      </button>

      <div className="flex-1 min-w-0 text-center">
        <p className="text-sm font-semibold text-white/95 truncate">{formatWeekLabel(weekKey)}</p>
        {isCurrent ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">Bieżący tydzień</p>
        ) : (
          <p className="text-[10px] text-slate-500">Tydzień kalendarzowy</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onWeekChange(addWeeks(weekKey, 1))}
        className="shrink-0 w-9 h-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-lg leading-none"
        title="Następny tydzień"
        aria-label="Następny tydzień"
      >
        ›
      </button>

      {showTodayButton && !isCurrent && (
        <button
          type="button"
          onClick={() => onWeekChange(getWeekKey())}
          className="shrink-0 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/20 transition"
        >
          Dziś
        </button>
      )}
    </div>
  )
}

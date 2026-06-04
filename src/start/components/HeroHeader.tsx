import { getActiveShifts, getEmployeeMap, getGreeting, getTodayKey, formatShiftTime } from '../lib/scheduleUtils'
import type { Employee, WeekSchedule } from '../types'
import { DAY_LABELS } from '../types'
import { SearchBar } from './SearchBar'

interface HeroHeaderProps {
  employees: Employee[]
  schedule: WeekSchedule
  companyName: string
  time: string
  date: string
  showSearch: boolean
  searchEngine: 'google' | 'duckduckgo'
  openHandoverCount: number
}

export function HeroHeader({
  employees,
  schedule,
  companyName,
  time,
  date,
  showSearch,
  searchEngine,
  openHandoverCount,
}: HeroHeaderProps) {
  const today = getTodayKey()
  const active = getActiveShifts(schedule, today)
  const empMap = getEmployeeMap(employees)
  const greeting = getGreeting()

  return (
    <header className="hero-shell">
      <div className="hero-inner panel p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="status-live">
                <span className="status-live-dot" />
                Na żywo
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/90">
                {greeting} · {DAY_LABELS[today]}
              </span>
            </div>
            <h1 className="text-3xl md:text-[2.75rem] font-black tracking-tight leading-none text-white">
              {companyName}
            </h1>
            <p className="text-slate-400 mt-2 capitalize text-sm">{date}</p>

            {showSearch && (
              <div className="mt-5 max-w-xl">
                <SearchBar searchEngine={searchEngine} embedded />
              </div>
            )}
          </div>

          <div className="shrink-0 text-left xl:text-right">
            <div className="clock-display">{time.slice(0, 5)}</div>
            <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">{time.slice(6)}</p>
            <div className="flex flex-wrap xl:justify-end gap-2 mt-4">
              <StatChip label="Na zmianie" value={String(active.length)} variant="live" />
              <StatChip label="Przekazania" value={String(openHandoverCount)} variant="warn" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.07]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90 mb-3">
            Teraz na zmianie
          </p>
          {active.length === 0 ? (
            <p className="text-slate-500 text-sm">Nikogo na zmianie — sprawdź grafik poniżej.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              {active.map((shift) => {
                const emp = empMap.get(shift.employeeId)
                if (!emp) return null
                return (
                  <div key={`${shift.employeeId}-${shift.start}`} className="shift-chip shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: `${emp.color}30`, color: emp.color, border: `1px solid ${emp.color}55` }}
                    >
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {emp.role} · {formatShiftTime(shift)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function StatChip({
  label,
  value,
  variant,
}: {
  label: string
  value: string
  variant: 'live' | 'warn'
}) {
  return (
    <div
      className={`px-3 py-2 rounded-xl border text-left ${
        variant === 'live'
          ? 'bg-emerald-500/10 border-emerald-500/25'
          : 'bg-amber-500/10 border-amber-500/25'
      }`}
    >
      <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-lg font-black tabular-nums ${variant === 'live' ? 'text-emerald-300' : 'text-amber-300'}`}>
        {value}
      </p>
    </div>
  )
}

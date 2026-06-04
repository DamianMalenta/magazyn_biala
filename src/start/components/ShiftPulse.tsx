import { getActiveShifts, getEmployeeMap, getGreeting, getTodayKey, formatShiftTime } from '../lib/scheduleUtils'
import type { Employee, WeekSchedule } from '../types'
import { DAY_LABELS } from '../types'

interface ShiftPulseProps {
  employees: Employee[]
  schedule: WeekSchedule
  companyName: string
  time: string
  date: string
}

export function ShiftPulse({ employees, schedule, companyName, time, date }: ShiftPulseProps) {
  const today = getTodayKey()
  const active = getActiveShifts(schedule, today)
  const empMap = getEmployeeMap(employees)
  const greeting = getGreeting()

  return (
    <header className="glass rounded-3xl p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-1">
            {greeting} · {DAY_LABELS[today]}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{companyName}</h1>
          <p className="text-slate-400 mt-1 capitalize">{date}</p>
        </div>

        <div className="text-right">
          <div className="text-5xl md:text-6xl font-mono font-light tabular-nums tracking-tighter">
            {time.slice(0, 5)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">{time.slice(6)}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Teraz na zmianie ({active.length})
          </h2>
        </div>

        {active.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Nikogo na zmianie w tej chwili — sprawdź grafik poniżej.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {active.map((shift) => {
              const emp = empMap.get(shift.employeeId)
              if (!emp) return null
              return (
                <div
                  key={`${shift.employeeId}-${shift.start}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 pulse-live"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ background: `${emp.color}33`, color: emp.color }}
                  >
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{emp.name}</p>
                    <p className="text-xs text-slate-400">
                      {emp.role} · {formatShiftTime(shift)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}

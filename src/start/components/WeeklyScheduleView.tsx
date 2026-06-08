import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type WeekSchedule } from '../types'
import { formatShiftTime, getEmployeeMap, getTodayKey } from '../lib/scheduleUtils'
import { SectionHeader } from './SectionHeader'

interface WeeklyScheduleViewProps {
  schedule: WeekSchedule
  employees: Employee[]
}

const GRID_COLS = 'grid-cols-[minmax(148px,1.35fr)_repeat(7,minmax(68px,1fr))]'
const ROW_HEIGHT = 'min-h-[58px]'

export function WeeklyScheduleView({ schedule, employees }: WeeklyScheduleViewProps) {
  const today = getTodayKey()
  const empMap = getEmployeeMap(employees)
  const todayShifts = (schedule[today] ?? []).length

  return (
    <section className="panel panel-accent p-4 md:p-5 overflow-hidden">
      <SectionHeader
        icon="📅"
        title="Grafik tygodniowy"
        badge={`Dziś: ${DAY_LABELS[today]}`}
        badgeVariant="amber"
      />

      <div className="mb-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mb-2">
          Dziś na grafiku ({todayShifts} {todayShifts === 1 ? 'zmiana' : 'zmian'})
        </p>
        <div className="flex flex-wrap gap-2">
          {(schedule[today] ?? []).length === 0 ? (
            <span className="text-sm text-slate-500 italic">Brak wpisów na dziś</span>
          ) : (
            (schedule[today] ?? []).map((shift, i) => {
              const emp = empMap.get(shift.employeeId)
              if (!emp) return null
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{
                    background: `${emp.color}15`,
                    borderColor: `${emp.color}35`,
                    color: emp.color,
                  }}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: emp.color }} />
                  {emp.name} · {formatShiftTime(shift)}
                </span>
              )
            })
          )}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
        <div className="min-w-[720px]">
          <div className={`grid ${GRID_COLS} gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5`}>
            <div className="p-2 sticky left-0 z-10 bg-slate-900/90 rounded-lg">Osoba</div>
            {DAY_KEYS.map((day) => (
              <div
                key={day}
                className={`p-2 text-center rounded-lg ${
                  day === today ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/30' : 'bg-white/[0.03]'
                }`}
              >
                {DAY_LABELS[day]}
                {day === today && <span className="block text-[10px] text-amber-400/80 normal-case">dziś</span>}
              </div>
            ))}
          </div>

          {employees.map((emp) => (
            <div key={emp.id} className={`grid ${GRID_COLS} gap-1.5 mb-1.5 items-stretch`}>
              <div
                className={`sticky left-0 z-10 flex items-center gap-2 px-2.5 py-1.5 ${ROW_HEIGHT} rounded-xl border border-white/10 bg-slate-900/90`}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: emp.color }} />
                <div className="min-w-0">
                  <p className="font-semibold truncate text-sm text-white/95">{emp.name || '—'}</p>
                  {emp.role && <p className="text-[11px] text-slate-400 truncate">{emp.role}</p>}
                </div>
              </div>
              {DAY_KEYS.map((day) => (
                <DayCell key={day} day={day} today={today} employeeId={emp.id} schedule={schedule} empMap={empMap} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DayCell({
  day,
  today,
  employeeId,
  schedule,
  empMap,
}: {
  day: DayKey
  today: DayKey
  employeeId: string
  schedule: WeekSchedule
  empMap: Map<string, Employee>
}) {
  const shifts = (schedule[day] ?? []).filter((s) => s.employeeId === employeeId)
  const isToday = day === today

  return (
    <div
      className={`${ROW_HEIGHT} px-1.5 py-1.5 rounded-xl border text-center text-sm leading-tight flex items-center justify-center ${
        isToday
          ? 'bg-amber-500/10 border-amber-500/25 font-semibold'
          : shifts.length > 0
            ? 'bg-white/[0.04] border-white/10'
            : 'bg-white/[0.02] border-white/5'
      }`}
    >
      {shifts.length === 0 ? (
        <span className="text-slate-600">—</span>
      ) : (
        <div>
          {shifts.map((s, i) => {
            const emp = empMap.get(s.employeeId)
            return (
              <div key={i}>
                <span
                  style={{ color: isToday ? undefined : emp?.color }}
                  className={`font-mono font-semibold text-sm ${isToday ? 'text-amber-100' : ''}`}
                  title={`${s.start}–${s.end}`}
                >
                  {formatShiftTime(s)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

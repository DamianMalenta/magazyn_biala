import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type WeekSchedule } from '../types'
import { formatShiftTime, getEmployeeMap, getTodayKey } from '../lib/scheduleUtils'
import { SectionHeader } from './SectionHeader'

interface WeeklyScheduleViewProps {
  schedule: WeekSchedule
  employees: Employee[]
}

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
        <div className="min-w-[680px]">
          <div className="grid grid-cols-8 gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <div className="p-2">Osoba</div>
            {DAY_KEYS.map((day) => (
              <div
                key={day}
                className={`p-2 text-center rounded-lg ${
                  day === today ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/30' : ''
                }`}
              >
                {DAY_LABELS[day]}
                {day === today && <span className="block text-[10px] text-amber-400/80 normal-case">dziś</span>}
              </div>
            ))}
          </div>

          {employees.map((emp) => (
            <div key={emp.id} className="grid grid-cols-8 gap-1 mb-1">
              <div className="p-2 flex items-center gap-2 rounded-lg bg-white/[0.04]">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: emp.color }} />
                <span className="font-medium truncate text-sm">{emp.name}</span>
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
      className={`p-1.5 min-h-[48px] rounded-lg text-center text-sm leading-tight flex items-center justify-center ${
        isToday ? 'bg-amber-500/10 ring-1 ring-amber-500/25 font-semibold' : 'bg-white/[0.02]'
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
                  className={`font-mono font-semibold ${isToday ? 'text-amber-100' : ''}`}
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

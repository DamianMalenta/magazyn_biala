import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type WeekSchedule } from '../types'
import { formatShiftTime, getEmployeeMap, getTodayKey } from '../lib/scheduleUtils'

interface WeeklyScheduleViewProps {
  schedule: WeekSchedule
  employees: Employee[]
}

export function WeeklyScheduleView({ schedule, employees }: WeeklyScheduleViewProps) {
  const today = getTodayKey()
  const empMap = getEmployeeMap(employees)

  return (
    <section className="glass rounded-3xl p-6 overflow-x-auto scrollbar-thin">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📅</span> Grafik tygodniowy
      </h2>

      <div className="min-w-[640px]">
        <div className="grid grid-cols-8 gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          <div className="p-2">Osoba</div>
          {DAY_KEYS.map((day) => (
            <div
              key={day}
              className={`p-2 text-center rounded-lg ${day === today ? 'bg-violet-500/20 text-violet-300' : ''}`}
            >
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {employees.map((emp) => (
          <div key={emp.id} className="grid grid-cols-8 gap-1 mb-1">
            <div className="p-2 flex items-center gap-2 rounded-lg bg-white/5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: emp.color }} />
              <span className="font-medium truncate">{emp.name}</span>
            </div>
            {DAY_KEYS.map((day) => (
              <DayCell key={day} day={day} today={today} employeeId={emp.id} schedule={schedule} empMap={empMap} />
            ))}
          </div>
        ))}
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
      className={`p-1.5 min-h-[52px] rounded-lg text-center text-[11px] leading-tight ${
        isToday ? 'bg-violet-500/10 ring-1 ring-violet-500/30' : 'bg-white/[0.02]'
      }`}
    >
      {shifts.length === 0 ? (
        <span className="text-slate-600">—</span>
      ) : (
        shifts.map((s, i) => {
          const emp = empMap.get(s.employeeId)
          return (
            <div key={i} className="py-0.5">
              <span style={{ color: emp?.color }}>{formatShiftTime(s)}</span>
              {s.note && <p className="text-slate-500 truncate">{s.note}</p>}
            </div>
          )
        })
      )}
    </div>
  )
}

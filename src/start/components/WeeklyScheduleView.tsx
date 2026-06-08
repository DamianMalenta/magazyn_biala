import { useState } from 'react'
import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type ScheduleByWeek, type WeekSchedule } from '../types'
import { formatShiftTime, getEmployeeMap, getWeekSchedule } from '../lib/scheduleUtils'
import { getDayKeyInWeek, getWeekKey, isCurrentWeek } from '../lib/weekCalendar'
import { SectionHeader } from './SectionHeader'
import { WeekNavigator } from './WeekNavigator'

interface WeeklyScheduleViewProps {
  schedules: ScheduleByWeek
  employees: Employee[]
}

const GRID_COLS = 'grid-cols-[minmax(148px,1.35fr)_repeat(7,minmax(68px,1fr))]'
const ROW_HEIGHT = 'min-h-[58px]'

export function WeeklyScheduleView({ schedules, employees }: WeeklyScheduleViewProps) {
  const [viewWeekKey, setViewWeekKey] = useState(() => getWeekKey())
  const schedule = getWeekSchedule(schedules, viewWeekKey)
  const isCurrent = isCurrentWeek(viewWeekKey)
  const todayInView = isCurrent ? getDayKeyInWeek(viewWeekKey) : null
  const empMap = getEmployeeMap(employees)
  const todayShifts = todayInView ? (schedule[todayInView] ?? []).length : 0

  return (
    <section className="panel panel-accent p-4 md:p-5 overflow-hidden">
      <div className="flex flex-col gap-3 mb-3">
        <SectionHeader
          icon="📅"
          title="Grafik tygodniowy"
          badge={isCurrent ? `Dziś: ${todayInView ? DAY_LABELS[todayInView] : '—'}` : 'Podgląd'}
          badgeVariant={isCurrent ? 'amber' : 'neutral'}
        />
        <WeekNavigator weekKey={viewWeekKey} onWeekChange={setViewWeekKey} />
      </div>

      {isCurrent && todayInView && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mb-2">
            Dziś na grafiku ({todayShifts} {todayShifts === 1 ? 'zmiana' : 'zmian'})
          </p>
          <div className="flex flex-wrap gap-2">
            {(schedule[todayInView] ?? []).length === 0 ? (
              <span className="text-sm text-slate-500 italic">Brak wpisów na dziś</span>
            ) : (
              (schedule[todayInView] ?? []).map((shift, i) => {
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
      )}

      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
        <div className="min-w-[720px]">
          <div className={`grid ${GRID_COLS} gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5`}>
            <div className="p-2 sticky left-0 z-10 bg-slate-900/90 rounded-lg">Osoba</div>
            {DAY_KEYS.map((day) => (
              <div
                key={day}
                className={`p-2 text-center rounded-lg ${
                  day === todayInView
                    ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/30'
                    : 'bg-white/[0.03]'
                }`}
              >
                {DAY_LABELS[day]}
                {day === todayInView && <span className="block text-[10px] text-amber-400/80 normal-case">dziś</span>}
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
                <DayCell
                  key={day}
                  day={day}
                  todayInView={todayInView}
                  employeeId={emp.id}
                  schedule={schedule}
                  empMap={empMap}
                />
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
  todayInView,
  employeeId,
  schedule,
  empMap,
}: {
  day: DayKey
  todayInView: DayKey | null
  employeeId: string
  schedule: WeekSchedule
  empMap: Map<string, Employee>
}) {
  const shifts = (schedule[day] ?? []).filter((s) => s.employeeId === employeeId)
  const isToday = day === todayInView

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

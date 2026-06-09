import { useState } from 'react'
import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type ScheduleByWeek, type WeekSchedule } from '../types'
import { formatShiftTime, getEmployeeMap, getWeekSchedule } from '../lib/scheduleUtils'
import { getDayKeyInWeek, getWeekKey, isCurrentWeek } from '../lib/weekCalendar'
import { SectionHeader } from './SectionHeader'
import { WeekNavigator } from './WeekNavigator'
import { StartModal } from './StartModal'

interface WeeklyScheduleViewProps {
  schedules: ScheduleByWeek
  employees: Employee[]
}

type ScheduleVariant = 'compact' | 'expanded'

const GRID_COLS = {
  compact: 'grid-cols-[minmax(148px,1.35fr)_repeat(7,minmax(68px,1fr))]',
  expanded: 'grid-cols-[minmax(180px,1.4fr)_repeat(7,minmax(88px,1fr))]',
} as const

const ROW_HEIGHT = {
  compact: 'min-h-[58px]',
  expanded: 'min-h-[72px]',
} as const

export function WeeklyScheduleView({ schedules, employees }: WeeklyScheduleViewProps) {
  const [viewWeekKey, setViewWeekKey] = useState(() => getWeekKey())
  const [modalOpen, setModalOpen] = useState(false)
  const schedule = getWeekSchedule(schedules, viewWeekKey)
  const isCurrent = isCurrentWeek(viewWeekKey)
  const todayInView = isCurrent ? getDayKeyInWeek(viewWeekKey) : null
  const empMap = getEmployeeMap(employees)
  const todayShifts = todayInView ? (schedule[todayInView] ?? []).length : 0

  const scheduleContent = (variant: ScheduleVariant) => (
    <>
      {isCurrent && todayInView && (
        <TodaySummary
          todayInView={todayInView}
          todayShifts={todayShifts}
          schedule={schedule}
          empMap={empMap}
          variant={variant}
        />
      )}
      <ScheduleGrid
        employees={employees}
        schedule={schedule}
        todayInView={todayInView}
        empMap={empMap}
        variant={variant}
      />
    </>
  )

  return (
    <>
      <section className="panel panel-accent p-4 md:p-5 overflow-hidden">
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <SectionHeader
                icon="📅"
                title="Grafik tygodniowy"
                badge={isCurrent ? `Dziś: ${todayInView ? DAY_LABELS[todayInView] : '—'}` : 'Podgląd'}
                badgeVariant={isCurrent ? 'amber' : 'neutral'}
              />
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shrink-0 w-9 h-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-base leading-none"
              title="Powiększ grafik"
              aria-label="Powiększ grafik w oknie"
            >
              ⛶
            </button>
          </div>
          <WeekNavigator weekKey={viewWeekKey} onWeekChange={setViewWeekKey} />
        </div>

        {scheduleContent('compact')}
      </section>

      <StartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Grafik tygodniowy"
        icon="📅"
        maxWidth="full"
        bodyClassName="start-modal-body-wide"
      >
        <div className="flex flex-col gap-3">
          <WeekNavigator weekKey={viewWeekKey} onWeekChange={setViewWeekKey} />
          {scheduleContent('expanded')}
        </div>
      </StartModal>
    </>
  )
}

function TodaySummary({
  todayInView,
  todayShifts,
  schedule,
  empMap,
  variant,
}: {
  todayInView: DayKey
  todayShifts: number
  schedule: WeekSchedule
  empMap: Map<string, Employee>
  variant: ScheduleVariant
}) {
  return (
    <div
      className={`mb-3 rounded-xl bg-amber-500/8 border border-amber-500/15 ${
        variant === 'expanded' ? 'p-4' : 'p-3'
      }`}
    >
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
  )
}

function ScheduleGrid({
  employees,
  schedule,
  todayInView,
  empMap,
  variant,
}: {
  employees: Employee[]
  schedule: WeekSchedule
  todayInView: DayKey | null
  empMap: Map<string, Employee>
  variant: ScheduleVariant
}) {
  const gridCols = GRID_COLS[variant]
  const rowHeight = ROW_HEIGHT[variant]
  const minWidth = variant === 'expanded' ? 'min-w-[860px]' : 'min-w-[720px]'

  return (
    <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
      <div className={minWidth}>
        <div
          className={`grid ${gridCols} gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5`}
        >
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
          <div key={emp.id} className={`grid ${gridCols} gap-1.5 mb-1.5 items-stretch`}>
            <div
              className={`sticky left-0 z-10 flex items-center gap-2 px-2.5 py-1.5 ${rowHeight} rounded-xl border border-white/10 bg-slate-900/90`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: emp.color }} />
              <div className="min-w-0">
                <p className={`font-semibold truncate text-white/95 ${variant === 'expanded' ? 'text-base' : 'text-sm'}`}>
                  {emp.name || '—'}
                </p>
                {emp.role && (
                  <p className={`text-slate-400 truncate ${variant === 'expanded' ? 'text-xs' : 'text-[11px]'}`}>
                    {emp.role}
                  </p>
                )}
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
                variant={variant}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DayCell({
  day,
  todayInView,
  employeeId,
  schedule,
  empMap,
  variant,
}: {
  day: DayKey
  todayInView: DayKey | null
  employeeId: string
  schedule: WeekSchedule
  empMap: Map<string, Employee>
  variant: ScheduleVariant
}) {
  const shifts = (schedule[day] ?? []).filter((s) => s.employeeId === employeeId)
  const isToday = day === todayInView
  const rowHeight = ROW_HEIGHT[variant]

  return (
    <div
      className={`${rowHeight} px-1.5 py-1.5 rounded-xl border text-center leading-tight flex items-center justify-center ${
        variant === 'expanded' ? 'text-base' : 'text-sm'
      } ${
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
                  className={`font-mono font-semibold ${variant === 'expanded' ? 'text-base' : 'text-sm'} ${
                    isToday ? 'text-amber-100' : ''
                  }`}
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

import { useState } from 'react'
import {
  getActiveShifts,
  getEmployeeMap,
  getGreeting,
  getTodayKey,
  formatShiftTime,
} from '../lib/scheduleUtils'
import { loadHandoverAuthor, sortHandoverNotes } from '../lib/handoverUtils'
import type { Employee, HandoverNote, ScheduleByWeek } from '../types'
import { getCurrentWeekSchedule } from '../lib/scheduleUtils'
import { DAY_LABELS } from '../types'
import { SearchBar } from './SearchBar'
import { WeatherWidget } from './WeatherWidget'
import type { WeatherData } from '../lib/weatherUtils'
import { StartModal } from './StartModal'
import { HandoverCard } from './HandoverCard'

interface HeroHeaderProps {
  employees: Employee[]
  schedules: ScheduleByWeek
  companyName: string
  time: string
  date: string
  showSearch: boolean
  showWeather: boolean
  weather: { data: WeatherData | null; loading: boolean; error: boolean }
  searchEngine: 'google' | 'duckduckgo'
  openHandoverCount: number
  handoverNotes: HandoverNote[]
  onHandoverUpdate: (notes: HandoverNote[]) => void
}

export function HeroHeader({
  employees,
  schedules,
  companyName,
  time,
  date,
  showSearch,
  showWeather,
  weather,
  searchEngine,
  openHandoverCount,
  handoverNotes,
  onHandoverUpdate,
}: HeroHeaderProps) {
  const today = getTodayKey()
  const active = getActiveShifts(getCurrentWeekSchedule(schedules), today)
  const empMap = getEmployeeMap(employees)
  const greeting = getGreeting()

  const [shiftModalOpen, setShiftModalOpen] = useState(false)
  const [handoverModalOpen, setHandoverModalOpen] = useState(false)

  const sortedHandovers = sortHandoverNotes(handoverNotes)
  const activeHandovers = sortedHandovers.filter((n) => !n.done)

  const toggleHandover = (id: string) => {
    const doneBy = loadHandoverAuthor().trim() || 'Zespół'
    onHandoverUpdate(
      handoverNotes.map((n) => {
        if (n.id !== id) return n
        if (n.done) {
          return { ...n, done: false, doneAt: undefined, doneBy: undefined }
        }
        return {
          ...n,
          done: true,
          doneAt: new Date().toISOString(),
          doneBy,
        }
      }),
    )
  }

  return (
    <>
      <header className="hero-shell">
        <div className="hero-inner hero-inner-compact panel p-4 md:p-5">
          <div className="hero-top-row">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="status-live">
                <span className="status-live-dot" />
                Na żywo
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/90">
                {greeting} · {DAY_LABELS[today]}
              </span>
            </div>

            <div className="hero-meta-col">
              {showWeather && (
                <WeatherWidget
                  data={weather.data}
                  loading={weather.loading}
                  error={weather.error}
                  compact
                />
              )}
              <div className="hero-clock-block">
                <div className="clock-display clock-display-compact">{time.slice(0, 5)}</div>
                <p className="text-[10px] text-slate-500 font-mono tabular-nums">{time.slice(6)}</p>
              </div>
            </div>
          </div>

          <div className="hero-title-row">
            <h1 className="hero-title">{companyName}</h1>
            <div className="hero-stat-group">
              <HeroStatButton
                label="Na zmianie"
                value={active.length}
                variant="live"
                onClick={() => setShiftModalOpen(true)}
              />
              <HeroStatButton
                label="Przekazania"
                value={openHandoverCount}
                variant="warn"
                pulse={openHandoverCount > 0}
                onClick={() => setHandoverModalOpen(true)}
              />
            </div>
          </div>

          <div className="hero-sub-row">
            <p className="text-slate-400 capitalize text-xs shrink-0">{date}</p>
            {showSearch && (
              <div className="hero-search-wrap">
                <SearchBar searchEngine={searchEngine} embedded compact />
              </div>
            )}
          </div>
        </div>
      </header>

      <StartModal
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        title={`Na zmianie teraz (${active.length})`}
        icon="👥"
        maxWidth="md"
      >
        {active.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">Nikogo na zmianie w tej chwili — sprawdź grafik poniżej.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((shift) => {
              const emp = empMap.get(shift.employeeId)
              if (!emp) return null
              return (
                <li key={`${shift.employeeId}-${shift.start}`} className="shift-chip-modal">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: `${emp.color}30`,
                      color: emp.color,
                      border: `1px solid ${emp.color}55`,
                    }}
                  >
                    {emp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{emp.name}</p>
                    <p className="text-xs text-slate-400">
                      {emp.role} · {formatShiftTime(shift)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </StartModal>

      <StartModal
        open={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        title={`Przekazania (${openHandoverCount} otwartych)`}
        icon="📌"
        maxWidth="lg"
      >
        <p className="text-[11px] text-slate-500 mb-3">
          Szybki podgląd — pełna tablica z dodawaniem notatek jest w sekcji po prawej / poniżej.
        </p>
        {activeHandovers.length === 0 ? (
          <p className="text-sm text-slate-400 py-2 italic">Brak otwartych przekazań — wszystko ogarnięte.</p>
        ) : (
          <div className="space-y-2 max-h-[min(50vh,360px)] overflow-y-auto scrollbar-thin pr-1">
            {activeHandovers.map((note) => (
              <HandoverCard
                key={note.id}
                note={note}
                employees={employees}
                onToggle={() => toggleHandover(note.id)}
                compact
              />
            ))}
          </div>
        )}
      </StartModal>
    </>
  )
}

function HeroStatButton({
  label,
  value,
  variant,
  pulse = false,
  onClick,
}: {
  label: string
  value: number
  variant: 'live' | 'warn'
  pulse?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hero-stat-btn ${variant === 'live' ? 'hero-stat-btn-live' : 'hero-stat-btn-warn'} ${
        pulse ? 'hero-stat-btn-pulse' : ''
      }`}
      title={`${label}: ${value} — kliknij, aby zobaczyć szczegóły`}
    >
      <span className="hero-stat-label">{label}</span>
      <span className="hero-stat-value">{value}</span>
    </button>
  )
}

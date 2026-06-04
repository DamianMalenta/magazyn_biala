import { useEffect, useRef, useState } from 'react'
import { uid } from '../../lib/storage'
import {
  SHIFT_PRESETS,
  applyPresetToCell,
  clearEmployeeRow,
  copyDayToWeek,
  fillWeekWithPreset,
  formatShiftShort,
  getShiftForCell,
  parseShiftInput,
  setShiftForCell,
} from '../../lib/shiftPresets'
import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type StartPageConfig } from '../../types'
import { getTodayKey } from '../../lib/scheduleUtils'
import { TabHeader, btnPrimary } from './AdminUi'

interface ScheduleEditorProps {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
  onToast: (msg: string) => void
}

type EditCell = { employeeId: string; day: DayKey }

export function ScheduleEditor({ config, patch, onToast }: ScheduleEditorProps) {
  const today = getTodayKey()
  const [editCell, setEditCell] = useState<EditCell | null>(null)
  const [customTime, setCustomTime] = useState('')

  const updateSchedule = (schedule: StartPageConfig['schedule']) => patch({ schedule })

  const updateEmployee = (id: string, field: keyof Employee, value: string) => {
    patch({
      employees: config.employees.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    })
  }

  const addEmployee = () => {
    patch({
      employees: [...config.employees, { id: uid(), name: '', color: '#8b5cf6', role: '' }],
    })
    onToast('Dodaj imię w pierwszej kolumnie')
  }

  const removeEmployee = (id: string, name: string) => {
    const label = name.trim() || 'tego pracownika'
    if (!window.confirm(`Usunąć ${label} z grafiku?`)) return
    patch({
      employees: config.employees.filter((e) => e.id !== id),
      schedule: clearEmployeeRow(config.schedule, id),
    })
    onToast('Usunięto z grafiku')
  }

  const applyPreset = (employeeId: string, day: DayKey, presetId: string) => {
    const preset = SHIFT_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    updateSchedule(applyPresetToCell(config.schedule, day, employeeId, preset))
    setEditCell(null)
    onToast(`${DAY_LABELS[day]}: ${preset.short}`)
  }

  const clearCell = (employeeId: string, day: DayKey) => {
    updateSchedule(setShiftForCell(config.schedule, day, employeeId, null))
    setEditCell(null)
  }

  const applyCustom = (employeeId: string, day: DayKey) => {
    const parsed = parseShiftInput(customTime)
    if (!parsed) {
      onToast('Format: 08:00-16:00')
      return
    }
    updateSchedule(setShiftForCell(config.schedule, day, employeeId, parsed))
    setCustomTime('')
    setEditCell(null)
    onToast('Zapisano zmianę')
  }

  const fillWeek = (employeeId: string, presetId: string) => {
    const preset = SHIFT_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    updateSchedule(fillWeekWithPreset(config.schedule, employeeId, preset))
    onToast(`Cały tydzień: ${preset.short}`)
  }

  const copyMondayToWeek = (employeeId: string) => {
    updateSchedule(copyDayToWeek(config.schedule, employeeId, 'pon'))
    onToast('Skopiowano Pon → cały tydzień')
  }

  return (
    <div>
      <TabHeader
        title="Grafik tygodniowy"
        description="Kliknij komórkę dnia → wybierz gotowy schemat godzin. Szybkie wypełnienie całego tygodnia jednym kliknięciem."
      />

      {/* Szybkie presety globalne */}
      <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Legenda — kliknij komórkę i wybierz:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SHIFT_PRESETS.map((p) => (
            <span
              key={p.id}
              className="px-2 py-1 rounded-lg bg-violet-500/15 text-violet-200 text-[11px] font-mono font-semibold"
            >
              {p.short}
            </span>
          ))}
          <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 text-[11px]">— = wolne</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="bg-white/5 text-slate-500 uppercase tracking-wider">
              <th className="p-2 text-left w-[140px] sticky left-0 bg-slate-900/95 z-10">Osoba</th>
              {DAY_KEYS.map((d) => (
                <th
                  key={d}
                  className={`p-2 text-center min-w-[72px] ${d === today ? 'text-violet-300 bg-violet-500/10' : ''}`}
                >
                  {DAY_LABELS[d]}
                </th>
              ))}
              <th className="p-2 text-center w-[100px]">Szybko</th>
            </tr>
          </thead>
          <tbody>
            {config.employees.map((emp) => (
              <tr key={emp.id} className="border-t border-white/5 group">
                <td className="p-2 sticky left-0 bg-slate-900/95 z-10">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={emp.color}
                      onChange={(e) => updateEmployee(emp.id, 'color', e.target.value)}
                      className="h-8 w-8 shrink-0 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                      title="Kolor"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <input
                        value={emp.name}
                        onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                        placeholder="Imię"
                        className="w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-violet-500 text-sm font-semibold"
                      />
                      <input
                        value={emp.role}
                        onChange={(e) => updateEmployee(emp.id, 'role', e.target.value)}
                        placeholder="Rola"
                        className="w-full px-2 py-0.5 rounded bg-transparent border-0 outline-none text-[10px] text-slate-500 placeholder:text-slate-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEmployee(emp.id, emp.name)}
                      className="opacity-0 group-hover:opacity-100 shrink-0 w-7 h-7 rounded-lg text-red-400 hover:bg-red-500/15 text-sm transition"
                      title="Usuń"
                    >
                      ×
                    </button>
                  </div>
                </td>

                {DAY_KEYS.map((day) => {
                  const shift = getShiftForCell(config.schedule, day, emp.id)
                  const isOpen = editCell?.employeeId === emp.id && editCell.day === day
                  const isToday = day === today

                  return (
                    <td key={day} className={`p-1 relative ${isToday ? 'bg-violet-500/5' : ''}`}>
                      <ShiftCellButton
                        shift={shift}
                        isToday={isToday}
                        isOpen={isOpen}
                        onClick={() => {
                          setEditCell(isOpen ? null : { employeeId: emp.id, day })
                          setCustomTime(shift ? `${shift.start}-${shift.end}` : '')
                        }}
                      />
                      {isOpen && (
                        <ShiftPopover
                          customTime={customTime}
                          onCustomChange={setCustomTime}
                          onPreset={(id) => applyPreset(emp.id, day, id)}
                          onCustom={() => applyCustom(emp.id, day)}
                          onClear={() => clearCell(emp.id, day)}
                          onClose={() => setEditCell(null)}
                        />
                      )}
                    </td>
                  )
                })}

                <td className="p-1">
                  <div className="flex flex-col gap-0.5">
                    <select
                      className="w-full px-1 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] outline-none focus:border-violet-500"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) fillWeek(emp.id, e.target.value)
                        e.target.value = ''
                      }}
                    >
                      <option value="">Cały tydz.…</option>
                      {SHIFT_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.short}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => copyMondayToWeek(emp.id)}
                      className="px-1 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-slate-400 hover:text-white transition"
                      title="Kopiuj poniedziałek na cały tydzień"
                    >
                      Pon→tydz.
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={addEmployee} className={`${btnPrimary} w-full mt-4`}>
        + Dodaj pracownika do grafiku
      </button>
    </div>
  )
}

function ShiftCellButton({
  shift,
  isToday,
  isOpen,
  onClick,
}: {
  shift: ReturnType<typeof getShiftForCell>
  isToday: boolean
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full min-h-[44px] px-1 py-1.5 rounded-lg border text-center font-mono text-[10px] leading-tight transition ${
        isOpen
          ? 'border-violet-500 bg-violet-500/20 ring-1 ring-violet-500/50'
          : shift
            ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
            : isToday
              ? 'border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15 text-slate-500'
              : 'border-white/10 bg-white/[0.03] hover:bg-white/10 text-slate-600 hover:text-slate-400'
      }`}
    >
      {shift ? (
        <>
          <span className="font-bold">{formatShiftShort(shift)}</span>
          {shift.note && <span className="block text-[8px] text-slate-400 truncate">{shift.note}</span>}
        </>
      ) : (
        '+'
      )}
    </button>
  )
}

function ShiftPopover({
  customTime,
  onCustomChange,
  onPreset,
  onCustom,
  onClear,
  onClose,
}: {
  customTime: string
  onCustomChange: (v: string) => void
  onPreset: (id: string) => void
  onCustom: () => void
  onClear: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-30 w-[148px] p-2 rounded-xl bg-slate-800 border border-white/15 shadow-2xl"
    >
      <div className="grid grid-cols-2 gap-1 mb-2">
        {SHIFT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id)}
            className="px-1.5 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-[10px] font-mono font-bold transition"
          >
            {p.short}
          </button>
        ))}
      </div>
      <div className="flex gap-1 mb-1">
        <input
          value={customTime}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCustom()}
          placeholder="08:00-16:00"
          className="flex-1 min-w-0 px-1.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono outline-none focus:border-violet-500"
          autoFocus
        />
        <button type="button" onClick={onCustom} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px]">
          OK
        </button>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="w-full py-1 rounded-lg text-[10px] text-red-400 hover:bg-red-500/10 transition"
      >
        Wolne (wyczyść)
      </button>
    </div>
  )
}

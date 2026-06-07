import { useEffect, useRef, useState } from 'react'
import { uid } from '../../lib/storage'
import {
  applyPresetToCell,
  buildPresetShort,
  clearEmployeeRow,
  copyDayToWeek,
  fillWeekWithPreset,
  formatShiftShort,
  getShiftForCell,
  normalizeShiftPreset,
  parseShiftInput,
  setShiftForCell,
} from '../../lib/shiftPresets'
import { DAY_KEYS, DAY_LABELS, type DayKey, type Employee, type ShiftPreset, type StartPageConfig } from '../../types'
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
  const presets = config.shiftPresets
  const [editCell, setEditCell] = useState<EditCell | null>(null)
  const [customTime, setCustomTime] = useState('')
  const [showPresetEditor, setShowPresetEditor] = useState(false)

  const updateSchedule = (schedule: StartPageConfig['schedule']) => patch({ schedule })

  const updatePresets = (shiftPresets: ShiftPreset[]) => patch({ shiftPresets })

  const updatePreset = (id: string, field: 'start' | 'end' | 'short' | 'label', value: string) => {
    updatePresets(
      presets.map((p) => {
        if (p.id !== id) return p
        const next = normalizeShiftPreset({ ...p, [field]: value })
        if (field === 'start' || field === 'end') {
          return {
            ...next,
            short: buildPresetShort(next.start, next.end),
            label: `${next.start}–${next.end}`,
          }
        }
        return next
      }),
    )
  }

  const syncPresetShorts = () => {
    updatePresets(presets.map((p) => normalizeShiftPreset({ ...p, short: buildPresetShort(p.start, p.end) })))
    onToast('Zaktualizowano skróty szablonów')
  }

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
    const preset = presets.find((p) => p.id === presetId)
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
      onToast('Format: 11:22 lub 11:00-22:00')
      return
    }
    updateSchedule(setShiftForCell(config.schedule, day, employeeId, parsed))
    setCustomTime('')
    setEditCell(null)
    onToast('Zapisano zmianę')
  }

  const fillWeek = (employeeId: string, presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
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
        description="Kliknij komórkę dnia → wybierz gotowy schemat godzin. Skrót 11:22 = 11:00–22:00."
      />

      {/* Edytowalne szablony */}
      <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPresetEditor((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
        >
          <span className="text-sm font-semibold text-white/90">Szablony godzin ({presets.length})</span>
          <span className="text-slate-400 text-sm">{showPresetEditor ? '▲' : '▼'}</span>
        </button>

        {showPresetEditor && (
          <div className="px-4 pb-4 border-t border-white/10">
            <p className="text-xs text-slate-400 mt-3 mb-3">
              Edytuj godziny start/koniec — skrót to to, co widać w grafiku (np. 11:22).
            </p>
            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
              {presets.map((p) => (
                <div key={p.id} className="grid grid-cols-[72px_1fr_1fr_1fr] gap-2 items-center">
                  <input
                    value={p.short}
                    onChange={(e) => updatePreset(p.id, 'short', e.target.value)}
                    className="px-2 py-2 rounded-lg bg-violet-500/15 border border-violet-500/25 text-sm font-mono font-bold text-violet-200 text-center outline-none focus:border-violet-400"
                    title="Skrót w grafiku"
                  />
                  <input
                    type="time"
                    value={p.start}
                    onChange={(e) => updatePreset(p.id, 'start', e.target.value)}
                    className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono outline-none focus:border-violet-500"
                  />
                  <input
                    type="time"
                    value={p.end}
                    onChange={(e) => updatePreset(p.id, 'end', e.target.value)}
                    className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono outline-none focus:border-violet-500"
                  />
                  <span className="text-xs text-slate-500 truncate">{p.label}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={syncPresetShorts}
              className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
            >
              Wygeneruj skróty z godzin (np. 11:00+22:00 → 11:22)
            </button>
          </div>
        )}

        {!showPresetEditor && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {presets.map((p) => (
              <span
                key={p.id}
                className="px-2.5 py-1.5 rounded-lg bg-violet-500/15 text-violet-200 text-sm font-mono font-semibold"
                title={p.label}
              >
                {p.short}
              </span>
            ))}
            <span className="px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-500 text-sm">— = wolne</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-white/5 text-slate-500 uppercase tracking-wider text-xs">
              <th className="p-2.5 text-left w-[160px] sticky left-0 bg-slate-900/95 z-10">Osoba</th>
              {DAY_KEYS.map((d) => (
                <th
                  key={d}
                  className={`p-2.5 text-center min-w-[80px] ${d === today ? 'text-violet-300 bg-violet-500/10' : ''}`}
                >
                  {DAY_LABELS[d]}
                </th>
              ))}
              <th className="p-2.5 text-center w-[110px]">Szybko</th>
            </tr>
          </thead>
          <tbody>
            {config.employees.map((emp) => (
              <tr key={emp.id} className="border-t border-white/5 group">
                <td className="p-2 sticky left-0 bg-slate-900/95 z-10">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={emp.color}
                      onChange={(e) => updateEmployee(emp.id, 'color', e.target.value)}
                      className="h-10 w-10 shrink-0 rounded-xl border border-white/20 bg-transparent cursor-pointer p-0.5"
                      title="Kolor"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <input
                        value={emp.name}
                        onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                        placeholder="Imię"
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-violet-500 text-sm font-semibold"
                      />
                      <input
                        value={emp.role}
                        onChange={(e) => updateEmployee(emp.id, 'role', e.target.value)}
                        placeholder="Rola"
                        className="w-full px-2 py-0.5 rounded bg-transparent border-0 outline-none text-xs text-slate-500 placeholder:text-slate-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEmployee(emp.id, emp.name)}
                      className="opacity-0 group-hover:opacity-100 shrink-0 w-8 h-8 rounded-lg text-red-400 hover:bg-red-500/15 text-base transition"
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
                    <td key={day} className={`p-1.5 relative ${isToday ? 'bg-violet-500/5' : ''}`}>
                      <ShiftCellButton
                        shift={shift}
                        isToday={isToday}
                        isOpen={isOpen}
                        onClick={() => {
                          setEditCell(isOpen ? null : { employeeId: emp.id, day })
                          setCustomTime(shift ? formatShiftShort(shift) : '')
                        }}
                      />
                      {isOpen && (
                        <ShiftPopover
                          presets={presets}
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

                <td className="p-1.5">
                  <div className="flex flex-col gap-1">
                    <select
                      className="w-full px-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-violet-500"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) fillWeek(emp.id, e.target.value)
                        e.target.value = ''
                      }}
                    >
                      <option value="">Cały tydz.…</option>
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>{p.short}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => copyMondayToWeek(emp.id)}
                      className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-400 hover:text-white transition"
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
      className={`w-full min-h-[52px] px-1.5 py-2 rounded-xl border text-center font-mono text-sm leading-tight transition ${
        isOpen
          ? 'border-violet-500 bg-violet-500/20 ring-2 ring-violet-500/50'
          : shift
            ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
            : isToday
              ? 'border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15 text-slate-500'
              : 'border-white/10 bg-white/[0.03] hover:bg-white/10 text-slate-600 hover:text-slate-400'
      }`}
    >
      {shift ? (
        <>
          <span className="font-bold text-base">{formatShiftShort(shift)}</span>
          {shift.note && <span className="block text-[10px] text-slate-400 truncate mt-0.5">{shift.note}</span>}
        </>
      ) : (
        <span className="text-lg text-slate-500">+</span>
      )}
    </button>
  )
}

function ShiftPopover({
  presets,
  customTime,
  onCustomChange,
  onPreset,
  onCustom,
  onClear,
  onClose,
}: {
  presets: ShiftPreset[]
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
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-30 w-[252px] p-3 rounded-2xl bg-slate-800 border border-white/15 shadow-2xl"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Wybierz zmianę</p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id)}
            className="px-1 py-2.5 rounded-xl bg-violet-600/80 hover:bg-violet-500 text-sm font-mono font-bold transition"
            title={p.label}
          >
            {p.short}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 mb-2">
        <input
          value={customTime}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCustom()}
          placeholder="11:22"
          className="flex-1 min-w-0 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-mono outline-none focus:border-violet-500"
          autoFocus
        />
        <button
          type="button"
          onClick={onCustom}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold"
        >
          OK
        </button>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="w-full py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
      >
        Wolne (wyczyść)
      </button>
    </div>
  )
}

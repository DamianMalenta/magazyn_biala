import { useEffect, useMemo, useState } from 'react'
import type { WeatherData, WeatherSelection } from '../lib/weatherUtils'
import {
  formatDayLabel,
  formatHourLabel,
  getHoursForDay,
  resolveWeatherDisplay,
  weatherCodeLabel,
  weatherCodeToEmoji,
} from '../lib/weatherUtils'

interface WeatherWidgetProps {
  data: WeatherData | null
  loading: boolean
  error: boolean
  compact?: boolean
}

const DEFAULT_SELECTION: WeatherSelection = { mode: 'now', dayIndex: 0 }

export function WeatherWidget({ data, loading, error, compact = false }: WeatherWidgetProps) {
  const [open, setOpen] = useState(false)
  const [selection, setSelection] = useState<WeatherSelection>(DEFAULT_SELECTION)

  useEffect(() => {
    setSelection(DEFAULT_SELECTION)
    setOpen(false)
  }, [data?.cityLabel, data?.fetchedAt])

  const display = useMemo(
    () => (data ? resolveWeatherDisplay(data, selection) : null),
    [data, selection],
  )

  const hoursForDay = useMemo(
    () => (data ? getHoursForDay(data, selection.dayIndex) : []),
    [data, selection.dayIndex],
  )

  if (loading && !data) {
    return (
      <div className={`weather-widget ${compact ? 'weather-widget-compact' : ''}`}>
        <span className="text-slate-500 text-xs animate-pulse">Pogoda…</span>
      </div>
    )
  }

  if (error || !data || !display) return null

  const pickNow = () => setSelection(DEFAULT_SELECTION)

  const pickDay = (dayIndex: number) => {
    const hours = getHoursForDay(data, dayIndex)
    setSelection({
      mode: hours.length > 0 ? 'hour' : 'day',
      dayIndex,
      hourTime: hours[0]?.time,
    })
  }

  const pickHour = (hourTime: string) => {
    setSelection({ mode: 'hour', dayIndex: selection.dayIndex, hourTime })
  }

  return (
    <div className={`weather-widget-wrap ${open ? 'weather-widget-wrap-open' : ''}`}>
      <button
        type="button"
        className={`weather-widget ${compact ? 'weather-widget-compact' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={open ? 'Zwiń prognozę' : 'Sprawdź pogodę na inny dzień lub godzinę'}
      >
        <span className="weather-emoji">{weatherCodeToEmoji(display.weatherCode)}</span>
        <div className="min-w-0 text-left">
          <p className="weather-temp">{display.temperature}°C</p>
          {!compact && (
            <>
              <p className="weather-city truncate">{display.cityLabel}</p>
              <p className="text-[9px] text-slate-500 truncate">
                {display.label} · {display.detail}
              </p>
            </>
          )}
        </div>
        {!compact && <span className="weather-expand-icon">{open ? '▴' : '▾'}</span>}
      </button>

      {open && !compact && (
        <div className="weather-forecast-panel">
          <div className="weather-forecast-toolbar">
            <button
              type="button"
              onClick={pickNow}
              className={`weather-chip ${selection.mode === 'now' ? 'weather-chip-active' : ''}`}
            >
              Teraz
            </button>
          </div>

          <p className="weather-forecast-label">Dzień</p>
          <div className="weather-day-row scrollbar-thin">
            {data.daily.map((day, i) => (
              <button
                key={day.date}
                type="button"
                onClick={() => pickDay(i)}
                className={`weather-chip ${selection.mode !== 'now' && selection.dayIndex === i ? 'weather-chip-active' : ''}`}
              >
                <span className="block text-[10px] opacity-80">{formatDayLabel(day.date, i)}</span>
                <span className="block font-bold tabular-nums">{day.tempMax}°</span>
              </button>
            ))}
          </div>

          {selection.mode !== 'now' && hoursForDay.length > 0 && (
            <>
              <p className="weather-forecast-label">Godzina</p>
              <div className="weather-hour-row scrollbar-thin">
                {hoursForDay.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => pickHour(slot.time)}
                    className={`weather-chip weather-hour-chip ${
                      selection.mode === 'hour' && selection.hourTime === slot.time ? 'weather-chip-active' : ''
                    }`}
                  >
                    <span className="block text-[10px] opacity-80">{formatHourLabel(slot.time)}</span>
                    <span className="block font-bold tabular-nums">{slot.temperature}°</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {selection.mode === 'day' && (
            <p className="weather-forecast-note">
              {weatherCodeLabel(display.weatherCode)} · zakres {display.detail}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

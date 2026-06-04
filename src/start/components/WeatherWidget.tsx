import type { WeatherData } from '../lib/weatherUtils'
import { weatherCodeLabel, weatherCodeToEmoji } from '../lib/weatherUtils'

interface WeatherWidgetProps {
  data: WeatherData | null
  loading: boolean
  error: boolean
  compact?: boolean
}

export function WeatherWidget({ data, loading, error, compact = false }: WeatherWidgetProps) {
  if (loading && !data) {
    return (
      <div className={`weather-widget ${compact ? 'weather-widget-compact' : ''}`}>
        <span className="text-slate-500 text-xs animate-pulse">Pogoda…</span>
      </div>
    )
  }

  if (error || !data) return null

  return (
    <div className={`weather-widget ${compact ? 'weather-widget-compact' : ''}`} title={weatherCodeLabel(data.weatherCode)}>
      <span className="weather-emoji">{weatherCodeToEmoji(data.weatherCode)}</span>
      <div className="min-w-0">
        <p className="weather-temp">{data.temperature}°C</p>
        {!compact && (
          <>
            <p className="weather-city truncate">{data.cityLabel}</p>
            <p className="text-[9px] text-slate-500">{weatherCodeLabel(data.weatherCode)} · wiatr {data.windSpeed} km/h</p>
          </>
        )}
      </div>
    </div>
  )
}

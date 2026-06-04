export interface WeatherConfig {
  city: string
  latitude: number | null
  longitude: number | null
}

export interface WeatherHourlySlot {
  time: string
  temperature: number
  weatherCode: number
  windSpeed: number
}

export interface WeatherDailySlot {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  windSpeedMax: number
}

export interface WeatherSnapshot {
  temperature: number
  weatherCode: number
  windSpeed: number
}

export interface WeatherData {
  cityLabel: string
  fetchedAt: string
  timezone: string
  current: WeatherSnapshot
  hourly: WeatherHourlySlot[]
  daily: WeatherDailySlot[]
}

export interface WeatherSelection {
  mode: 'now' | 'hour' | 'day'
  dayIndex: number
  hourTime?: string
}

export interface WeatherDisplay extends WeatherSnapshot {
  cityLabel: string
  label: string
  detail: string
}

const CACHE_KEY = 'startpage-weather-v2'
const CACHE_TTL_MS = 30 * 60 * 1000

interface WeatherCache {
  city: string
  lat: number
  lon: number
  data: WeatherData
}

export function weatherCodeToEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌦️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

export function weatherCodeLabel(code: number): string {
  if (code === 0) return 'Bezchmurnie'
  if (code <= 3) return 'Częściowe zachmurzenie'
  if (code <= 48) return 'Mgła'
  if (code <= 67) return 'Deszcz'
  if (code <= 77) return 'Śnieg'
  if (code <= 82) return 'Przelotne opady'
  if (code >= 95) return 'Burza'
  return 'Pogoda'
}

export function formatDayLabel(dateStr: string, dayIndex: number): string {
  if (dayIndex === 0) return 'Dziś'
  if (dayIndex === 1) return 'Jutro'
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  })
}

export function formatHourLabel(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

export function getHoursForDay(data: WeatherData, dayIndex: number): WeatherHourlySlot[] {
  const day = data.daily[dayIndex]
  if (!day) return []
  return data.hourly.filter((h) => h.time.startsWith(day.date))
}

export function resolveWeatherDisplay(data: WeatherData, selection: WeatherSelection): WeatherDisplay {
  if (selection.mode === 'now') {
    return {
      ...data.current,
      cityLabel: data.cityLabel,
      label: 'Teraz',
      detail: `${weatherCodeLabel(data.current.weatherCode)} · wiatr ${data.current.windSpeed} km/h`,
    }
  }

  const day = data.daily[selection.dayIndex]
  if (!day) {
    return {
      ...data.current,
      cityLabel: data.cityLabel,
      label: 'Teraz',
      detail: weatherCodeLabel(data.current.weatherCode),
    }
  }

  if (selection.mode === 'hour' && selection.hourTime) {
    const slot = data.hourly.find((h) => h.time === selection.hourTime)
    if (slot) {
      const dayLabel = formatDayLabel(day.date, selection.dayIndex)
      return {
        temperature: slot.temperature,
        weatherCode: slot.weatherCode,
        windSpeed: slot.windSpeed,
        cityLabel: data.cityLabel,
        label: `${dayLabel}, ${formatHourLabel(slot.time)}`,
        detail: `${weatherCodeLabel(slot.weatherCode)} · wiatr ${slot.windSpeed} km/h`,
      }
    }
  }

  const dayLabel = formatDayLabel(day.date, selection.dayIndex)
  return {
    temperature: Math.round((day.tempMax + day.tempMin) / 2),
    weatherCode: day.weatherCode,
    windSpeed: day.windSpeedMax,
    cityLabel: data.cityLabel,
    label: dayLabel,
    detail: `${day.tempMin}° – ${day.tempMax}° · ${weatherCodeLabel(day.weatherCode)}`,
  }
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const q = city.trim()
  if (!q) return null
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=pl&format=json`,
  )
  if (!res.ok) return null
  const json = (await res.json()) as { results?: { latitude: number; longitude: number; name: string; country?: string }[] }
  const hit = json.results?.[0]
  if (!hit) return null
  return {
    lat: hit.latitude,
    lon: hit.longitude,
    label: hit.country ? `${hit.name}, ${hit.country}` : hit.name,
  }
}

async function fetchWeather(lat: number, lon: number, cityLabel: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    forecast_days: '7',
    current: 'temperature_2m,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('weather fetch failed')
  const json = (await res.json()) as {
    timezone: string
    current: { temperature_2m: number; weather_code: number; wind_speed_10m: number }
    hourly: {
      time: string[]
      temperature_2m: number[]
      weather_code: number[]
      wind_speed_10m: number[]
    }
    daily: {
      time: string[]
      weather_code: number[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
      wind_speed_10m_max: number[]
    }
  }

  const hourly: WeatherHourlySlot[] = json.hourly.time.map((time, i) => ({
    time,
    temperature: Math.round(json.hourly.temperature_2m[i]),
    weatherCode: json.hourly.weather_code[i],
    windSpeed: Math.round(json.hourly.wind_speed_10m[i]),
  }))

  const daily: WeatherDailySlot[] = json.daily.time.map((date, i) => ({
    date,
    weatherCode: json.daily.weather_code[i],
    tempMax: Math.round(json.daily.temperature_2m_max[i]),
    tempMin: Math.round(json.daily.temperature_2m_min[i]),
    windSpeedMax: Math.round(json.daily.wind_speed_10m_max[i]),
  }))

  return {
    cityLabel,
    fetchedAt: new Date().toISOString(),
    timezone: json.timezone,
    current: {
      temperature: Math.round(json.current.temperature_2m),
      weatherCode: json.current.weather_code,
      windSpeed: Math.round(json.current.wind_speed_10m),
    },
    hourly,
    daily,
  }
}

function readCache(city: string): WeatherCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as WeatherCache
    if (c.city.toLowerCase() !== city.trim().toLowerCase()) return null
    if (Date.now() - new Date(c.data.fetchedAt).getTime() > CACHE_TTL_MS) return null
    if (!c.data.hourly?.length || !c.data.daily?.length) return null
    return c
  } catch {
    return null
  }
}

function writeCache(entry: WeatherCache): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
}

export async function loadWeather(config: WeatherConfig): Promise<WeatherData | null> {
  const city = config.city.trim()
  if (!city) return null

  const cached = readCache(city)
  if (cached) return cached.data

  let lat = config.latitude
  let lon = config.longitude
  let label = city

  if (lat == null || lon == null) {
    const geo = await geocodeCity(city)
    if (!geo) return null
    lat = geo.lat
    lon = geo.lon
    label = geo.label
  }

  const data = await fetchWeather(lat, lon, label)
  writeCache({ city, lat, lon, data })
  return data
}

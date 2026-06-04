export interface WeatherConfig {
  city: string
  latitude: number | null
  longitude: number | null
}

export interface WeatherData {
  temperature: number
  weatherCode: number
  windSpeed: number
  cityLabel: string
  fetchedAt: string
}

const CACHE_KEY = 'startpage-weather-v1'
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather fetch failed')
  const json = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number; wind_speed_10m: number }
  }
  return {
    temperature: Math.round(json.current.temperature_2m),
    weatherCode: json.current.weather_code,
    windSpeed: Math.round(json.current.wind_speed_10m),
    cityLabel,
    fetchedAt: new Date().toISOString(),
  }
}

function readCache(city: string): WeatherCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as WeatherCache
    if (c.city.toLowerCase() !== city.trim().toLowerCase()) return null
    if (Date.now() - new Date(c.data.fetchedAt).getTime() > CACHE_TTL_MS) return null
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

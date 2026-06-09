import { useEffect, useState } from 'react'
import type { WeatherConfig } from '../lib/weatherUtils'
import { loadWeather, type WeatherData } from '../lib/weatherUtils'

export function useWeather(config: WeatherConfig | undefined, enabled: boolean) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const city = config?.city?.trim() ?? ''
  const latitude = config?.latitude
  const longitude = config?.longitude
  const shouldLoad = enabled && city.length > 0

  useEffect(() => {
    if (!shouldLoad) {
      void Promise.resolve().then(() => {
        setData(null)
        setLoading(false)
        setError(false)
      })
      return
    }

    const weatherConfig: WeatherConfig = {
      city,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    }
    let cancelled = false

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      setError(false)

      try {
        const weather = await loadWeather(weatherConfig)
        if (!cancelled) {
          setData(weather)
          setError(!weather)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const id = setInterval(() => {
      void loadWeather(weatherConfig).then((weather) => {
        if (!cancelled && weather) setData(weather)
      })
    }, 30 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [shouldLoad, city, latitude, longitude])

  return { data, loading, error }
}

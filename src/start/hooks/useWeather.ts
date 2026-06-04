import { useEffect, useState } from 'react'
import type { WeatherConfig } from '../lib/weatherUtils'
import { loadWeather, type WeatherData } from '../lib/weatherUtils'

export function useWeather(config: WeatherConfig | undefined, enabled: boolean) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled || !config?.city?.trim()) {
      setData(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    void loadWeather(config)
      .then((w) => {
        if (!cancelled) {
          setData(w)
          setError(!w)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const id = setInterval(() => {
      void loadWeather(config).then((w) => {
        if (!cancelled && w) setData(w)
      })
    }, 30 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [enabled, config?.city, config?.latitude, config?.longitude])

  return { data, loading, error }
}

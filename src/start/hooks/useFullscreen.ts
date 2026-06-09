import { useCallback, useEffect, useState } from 'react'

interface UseFullscreenOptions {
  enabled: boolean
  lock: boolean
}

export function useFullscreen({ enabled, lock }: UseFullscreenOptions) {
  const [active, setActive] = useState(
    () =>
      typeof document !== 'undefined' && document.fullscreenElement === document.documentElement,
  )
  const [supported] = useState(() => typeof document !== 'undefined' && document.fullscreenEnabled)

  const sync = useCallback(() => {
    setActive(document.fullscreenElement === document.documentElement)
  }, [])

  const enter = useCallback(async () => {
    if (!supported) return false
    try {
      if (document.fullscreenElement !== document.documentElement) {
        await document.documentElement.requestFullscreen()
      }
      return true
    } catch {
      return false
    }
  }, [supported])

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return
    try {
      await document.exitFullscreen()
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) await exit()
    else await enter()
  }, [enter, exit])

  useEffect(() => {
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [sync])

  useEffect(() => {
    if (!enabled || !supported) return
    void document.documentElement.requestFullscreen().catch(() => {})
  }, [enabled, supported])

  useEffect(() => {
    if (!enabled || !lock || !supported) return

    const handler = () => {
      if (!document.fullscreenElement) {
        window.setTimeout(() => void enter(), 300)
      }
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [enabled, lock, supported, enter])

  return { active, supported, enter, exit, toggle }
}

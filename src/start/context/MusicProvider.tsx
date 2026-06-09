import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  delay,
  loadLastStation,
  saveLastStation,
  streamUrlsForStation,
  type MusicStation,
} from '../lib/musicUtils'
import { MusicContext } from './musicContext'

const RETRIES_PER_URL = 3
const RECOVERY_DELAY_MS = 8_000

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<MusicStation | null>(() => loadLastStation())
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [volume, setVolume] = useState(0.75)
  const [error, setError] = useState<string | null>(null)
  const [playerExpanded, setPlayerExpanded] = useState(false)

  const currentRef = useRef(current)
  const userPausedRef = useRef(false)
  const stoppedRef = useRef(false)
  const startingRef = useRef(false)
  const recoveringRef = useRef(false)
  const reconnectGenRef = useRef(0)
  const recoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    currentRef.current = current
  }, [current])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = volume
  }, [volume])

  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current)
      recoveryTimerRef.current = null
    }
  }, [])

  const cancelReconnect = useCallback(() => {
    reconnectGenRef.current += 1
    clearRecoveryTimer()
    setReconnecting(false)
    setBuffering(false)
  }, [clearRecoveryTimer])

  const tryPlayUrl = useCallback(async (el: HTMLAudioElement, url: string): Promise<boolean> => {
    el.src = url
    el.load()
    try {
      await el.play()
      return true
    } catch {
      return false
    }
  }, [])

  const reconnectStream = useCallback(async () => {
    const station = currentRef.current
    if (!station || stoppedRef.current || userPausedRef.current) return

    const el = audioRef.current
    if (!el) return

    const gen = ++reconnectGenRef.current
    recoveringRef.current = true
    setReconnecting(true)
    setBuffering(false)
    setError(null)

    const urls = streamUrlsForStation(station)

    try {
      for (const url of urls) {
        for (let attempt = 0; attempt < RETRIES_PER_URL; attempt++) {
          if (gen !== reconnectGenRef.current || stoppedRef.current || userPausedRef.current) return
          if (attempt > 0) await delay(1000 * 2 ** (attempt - 1))
          if (gen !== reconnectGenRef.current) return

          const ok = await tryPlayUrl(el, url)
          if (ok) {
            setPlaying(true)
            setReconnecting(false)
            setError(null)
            return
          }
        }
      }

      if (gen === reconnectGenRef.current) {
        setPlaying(false)
        setReconnecting(false)
        setError('Strumień niedostępny.')
      }
    } finally {
      if (gen === reconnectGenRef.current) recoveringRef.current = false
    }
  }, [tryPlayUrl])

  const scheduleRecovery = useCallback(() => {
    clearRecoveryTimer()
    recoveryTimerRef.current = setTimeout(() => {
      recoveryTimerRef.current = null
      if (stoppedRef.current || userPausedRef.current || !currentRef.current) return

      const el = audioRef.current
      if (!el) return

      if (el.src && el.paused && !el.ended) {
        void el
          .play()
          .then(() => {
            setPlaying(true)
            setBuffering(false)
            setReconnecting(false)
            setError(null)
          })
          .catch(() => void reconnectStream())
        return
      }

      void reconnectStream()
    }, RECOVERY_DELAY_MS)
  }, [clearRecoveryTimer, reconnectStream])

  const playStation = useCallback(
    async (station: MusicStation) => {
      const el = audioRef.current
      if (!el) return

      cancelReconnect()
      stoppedRef.current = false
      userPausedRef.current = false
      startingRef.current = true
      setError(null)
      setCurrent(station)
      saveLastStation(station)

      const urls = streamUrlsForStation(station)
      el.pause()

      for (let i = 0; i < urls.length; i++) {
        const ok = await tryPlayUrl(el, urls[i])
        if (ok) {
          setPlaying(true)
          startingRef.current = false
          return
        }
      }

      startingRef.current = false
      setPlaying(false)
      setError('Nie udało się odtworzyć stacji — spróbuj innej.')
    },
    [cancelReconnect, tryPlayUrl],
  )

  const togglePlay = useCallback(async () => {
    const el = audioRef.current
    if (!el) return

    if (playing) {
      cancelReconnect()
      userPausedRef.current = true
      el.pause()
      setPlaying(false)
      return
    }

    if (!current) return

    userPausedRef.current = false
    stoppedRef.current = false

    try {
      await el.play()
      setPlaying(true)
      setBuffering(false)
      setReconnecting(false)
      setError(null)
    } catch {
      setError('Kliknij ▶ jeszcze raz (wymagane działanie użytkownika).')
    }
  }, [playing, current, cancelReconnect])

  const stop = useCallback(() => {
    cancelReconnect()
    stoppedRef.current = true
    userPausedRef.current = false

    const el = audioRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    setPlaying(false)
    setCurrent(null)
    setPlayerExpanded(false)
  }, [cancelReconnect])

  const clearError = useCallback(() => setError(null), [])

  const handleStreamIssue = useCallback(() => {
    if (startingRef.current || recoveringRef.current || stoppedRef.current || userPausedRef.current) return
    clearRecoveryTimer()
    setBuffering(false)
    void reconnectStream()
  }, [clearRecoveryTimer, reconnectStream])

  const handleBuffering = useCallback(() => {
    if (startingRef.current || stoppedRef.current || userPausedRef.current || reconnecting) return
    setBuffering(true)
    scheduleRecovery()
  }, [reconnecting, scheduleRecovery])

  const handlePlaybackResumed = useCallback(() => {
    clearRecoveryTimer()
    setBuffering(false)
    setReconnecting(false)
    setPlaying(true)
    setError(null)
  }, [clearRecoveryTimer])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return

      const el = audioRef.current
      const station = currentRef.current
      if (!el || !station || stoppedRef.current || userPausedRef.current) return
      if (!el.paused) return

      if (el.src) {
        void el
          .play()
          .then(() => {
            setPlaying(true)
            setBuffering(false)
            setReconnecting(false)
            setError(null)
          })
          .catch(() => void reconnectStream())
      } else {
        void reconnectStream()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [reconnectStream])

  useEffect(() => () => clearRecoveryTimer(), [clearRecoveryTimer])

  return (
    <MusicContext.Provider
      value={{
        current,
        playing,
        buffering,
        reconnecting,
        volume,
        error,
        playerExpanded,
        setVolume,
        setPlayerExpanded,
        playStation,
        togglePlay,
        stop,
        clearError,
      }}
    >
      <audio
        ref={audioRef}
        preload="none"
        className="sr-only"
        aria-hidden
        onPlay={handlePlaybackResumed}
        onPlaying={handlePlaybackResumed}
        onPause={() => setPlaying(false)}
        onWaiting={handleBuffering}
        onStalled={handleBuffering}
        onError={handleStreamIssue}
      />
      {children}
    </MusicContext.Provider>
  )
}

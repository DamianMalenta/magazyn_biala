import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  loadLastStation,
  saveLastStation,
  streamUrlsForStation,
  type MusicStation,
} from '../lib/musicUtils'
import { MusicContext } from './musicContext'

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<MusicStation | null>(() => loadLastStation())
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.75)
  const [error, setError] = useState<string | null>(null)
  const [playerExpanded, setPlayerExpanded] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = volume
  }, [volume])

  const playStation = useCallback(async (station: MusicStation) => {
    const el = audioRef.current
    if (!el) return

    setError(null)
    setCurrent(station)
    saveLastStation(station)

    const urls = streamUrlsForStation(station)
    el.pause()

    for (let i = 0; i < urls.length; i++) {
      el.src = urls[i]
      el.load()
      try {
        await el.play()
        setPlaying(true)
        return
      } catch {
        if (i === urls.length - 1) {
          setPlaying(false)
          setError('Nie udało się odtworzyć stacji — spróbuj innej.')
        }
      }
    }
  }, [])

  const togglePlay = useCallback(async () => {
    const el = audioRef.current
    if (!el) return

    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }

    if (!current) return

    try {
      await el.play()
      setPlaying(true)
      setError(null)
    } catch {
      setError('Kliknij ▶ jeszcze raz (wymagane działanie użytkownika).')
    }
  }, [playing, current])

  const stop = useCallback(() => {
    const el = audioRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    setPlaying(false)
    setCurrent(null)
    setPlayerExpanded(false)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <MusicContext.Provider
      value={{
        current,
        playing,
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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false)
          setError('Strumień niedostępny.')
        }}
      />
      {children}
    </MusicContext.Provider>
  )
}

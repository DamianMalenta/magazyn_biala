import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { QuickLink } from '../types'
import { EMBED_SIZE_HEIGHT } from '../lib/linkOpenUtils'
import {
  MUSIC_CATEGORIES,
  fetchRadioStations,
  loadLastStation,
  saveLastStation,
  stationsForCategory,
  streamUrlsForStation,
  type MusicCategoryId,
  type MusicStation,
} from '../lib/musicUtils'

interface MusicPanelProps {
  link: QuickLink
  minimized: boolean
  onMinimize: () => void
  onExpand: () => void
  onClose: () => void
}

export function MusicPanel({ link, minimized, onMinimize, onExpand, onClose }: MusicPanelProps) {
  const height = EMBED_SIZE_HEIGHT[link.embedSize ?? 'medium']
  const audioRef = useRef<HTMLAudioElement>(null)

  const [category, setCategory] = useState<MusicCategoryId>('lounge')
  const [stations, setStations] = useState<MusicStation[]>(() => stationsForCategory('lounge'))
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<MusicStation | null>(() => loadLastStation())
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.75)
  const [error, setError] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState('')

  const loadCategory = useCallback(async (catId: MusicCategoryId) => {
    setCategory(catId)
    setError(null)
    const presets = stationsForCategory(catId)
    setStations(presets)
    setLoading(true)

    const cat = MUSIC_CATEGORIES.find((c) => c.id === catId)
    try {
      const online = cat?.search ? await fetchRadioStations(cat.search, 8) : []
      const merged = [...presets]
      for (const s of online) {
        if (!merged.some((m) => m.streamUrl === s.streamUrl)) merged.push(s)
      }
      setStations(merged)
    } catch {
      setStations(presets)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCategory('lounge')
  }, [loadCategory])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (minimized) onExpand()
        else onMinimize()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [minimized, onExpand, onMinimize])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = volume
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
          setError('Nie udało się odtworzyć tej stacji — spróbuj innej lub sprawdź internet.')
        }
      }
    }
  }, [])

  const stopPlayback = useCallback(() => {
    const el = audioRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    setPlaying(false)
    setCurrent(null)
    onClose()
  }, [onClose])

  const togglePlay = async () => {
    const el = audioRef.current
    if (!el) return

    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }

    if (!current && stations[0]) {
      await playStation(stations[0])
      return
    }

    try {
      await el.play()
      setPlaying(true)
      setError(null)
    } catch {
      setError('Odtwarzanie zablokowane — kliknij ▶ jeszcze raz (wymagane działanie użytkownika).')
    }
  }

  const playCustom = () => {
    const url = customUrl.trim()
    if (!url) return
    void playStation({
      id: 'custom',
      name: 'Własny strumień',
      streamUrl: url.includes('://') ? url : `https://${url}`,
      source: 'preset',
    })
  }

  const miniBar =
    typeof document !== 'undefined'
      ? createPortal(
          <div className="music-mini-bar" role="region" aria-label={`Muzyka: ${link.label}`}>
            <button type="button" onClick={onExpand} className="music-mini-bar-main" title="Rozwiń odtwarzacz">
              <span className={`music-mini-bar-icon ${playing ? 'music-mini-bar-icon-live' : ''}`}>
                {playing ? '♫' : '♪'}
              </span>
              <span className="music-mini-bar-text">
                <span className="music-mini-bar-title">{current?.name ?? link.label}</span>
                <span className="music-mini-bar-sub">{playing ? 'Gra w tle — kliknij aby rozwinąć' : 'Wstrzymane'}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="embed-btn embed-btn-primary music-mini-btn"
              title={playing ? 'Pauza' : 'Odtwórz'}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <button type="button" onClick={onExpand} className="embed-btn music-mini-btn" title="Rozwiń panel">
              ⊞
            </button>
            <button type="button" onClick={stopPlayback} className="embed-btn music-mini-btn" title="Zatrzymaj i zamknij">
              ×
            </button>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      {/* Jeden element audio — nie odmontowywać przy minimalizacji */}
      <audio
        ref={audioRef}
        preload="none"
        className="sr-only"
        aria-hidden
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false)
          setError('Strumień niedostępny — wybierz inną stację.')
        }}
      />

      {minimized ? (
        miniBar
      ) : (
        <section
          className="embed-inline-wrap music-panel-wrap"
          aria-label={`Muzyka: ${link.label}`}
          style={{ '--embed-h': height } as React.CSSProperties}
        >
          <div className="embed-inline-panel">
            <header className="embed-panel-header">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{link.icon}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{link.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {current ? (
                      <>
                        <span className={playing ? 'text-emerald-400' : 'text-slate-500'}>
                          {playing ? '● ' : '○ '}
                        </span>
                        {current.name}
                      </>
                    ) : (
                      'Radio i strumienie audio — bez wideo'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => void togglePlay()} className="embed-btn embed-btn-primary" title={playing ? 'Pauza' : 'Odtwórz'}>
                  {playing ? '⏸ Pauza' : '▶ Graj'}
                </button>
                <button type="button" onClick={onMinimize} className="embed-btn" title="Minimalizuj (muzyka gra dalej)">
                  ▁
                </button>
                <button type="button" onClick={stopPlayback} className="embed-btn" title="Zatrzymaj i zamknij">
                  ×
                </button>
              </div>
            </header>

            <div className="embed-panel-body music-panel-body">
              <div className="music-panel-toolbar">
                <div className="music-categories">
                  {MUSIC_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => void loadCategory(cat.id)}
                      className={`music-cat-btn ${category === cat.id ? 'music-cat-btn-active' : ''}`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="music-volume-row">
                  <span className="text-[10px] text-slate-500 shrink-0">Głośność</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="music-volume-slider"
                    aria-label="Głośność"
                  />
                </div>
              </div>

              {error && <p className="music-error-banner">{error}</p>}

              <div className="music-station-list" role="list">
                {loading && <p className="text-xs text-slate-500 px-3 py-2">Ładowanie stacji z katalogu…</p>}
                {stations.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    role="listitem"
                    onClick={() => void playStation(station)}
                    className={`music-station-row ${current?.id === station.id ? 'music-station-row-active' : ''}`}
                  >
                    {station.favicon ? (
                      <img src={station.favicon} alt="" className="music-station-favicon" />
                    ) : (
                      <span className="music-station-favicon music-station-favicon-placeholder">🎧</span>
                    )}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-semibold truncate">{station.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {[station.country, station.tags].filter(Boolean).join(' · ') || 'strumień audio'}
                      </p>
                    </div>
                    <span className="text-amber-400 text-xs shrink-0">
                      {current?.id === station.id && playing ? '●' : '▶'}
                    </span>
                  </button>
                ))}
              </div>

              <details className="music-legal-note">
                <summary>Prawa autorskie w lokalu (ważne)</summary>
                <p>
                  Odtwarzanie muzyki w restauracji to <strong>użycie publiczne</strong> — w Polsce zwykle wymaga opłat
                  dla ZAiKS/STOART (lub licencji zbiorczej).
                </p>
              </details>

              <div className="music-custom-stream">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && playCustom()}
                  placeholder="Własny URL strumienia HTTPS (MP3/AAC)"
                  className="embed-youtube-input text-xs"
                />
                <button type="button" onClick={playCustom} className="embed-btn shrink-0">
                  Odtwórz
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

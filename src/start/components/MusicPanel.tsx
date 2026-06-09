import { useCallback, useEffect, useState } from 'react'
import type { QuickLink } from '../types'
import { EMBED_SIZE_HEIGHT } from '../lib/linkOpenUtils'
import {
  MUSIC_CATEGORIES,
  fetchRadioStations,
  stationsForCategory,
  type MusicCategoryId,
  type MusicStation,
} from '../lib/musicUtils'
import { useMusic } from '../hooks/useMusic'
import type { MusicContextValue } from '../context/musicContext'

function streamStatusLabel(music: MusicContextValue): string {
  if (music.reconnecting) return 'Łączenie ponownie…'
  if (music.buffering) return 'Buforowanie…'
  if (music.playing) return 'Gra w tle — kliknij aby rozwinąć'
  return 'Wstrzymane'
}

function streamLiveIndicator(music: MusicContextValue): string {
  if (music.reconnecting || music.buffering) return '◌ '
  return music.playing ? '● ' : '○ '
}

interface MusicPanelProps {
  link: QuickLink
  minimized: boolean
  onMinimize: () => void
  onExpand: () => void
  onClose: () => void
}

export function MusicPanel({ link, minimized, onMinimize, onExpand, onClose }: MusicPanelProps) {
  const music = useMusic()
  const height = EMBED_SIZE_HEIGHT[link.embedSize ?? 'medium']

  const [category, setCategory] = useState<MusicCategoryId>('lounge')
  const [stations, setStations] = useState<MusicStation[]>(() => stationsForCategory('lounge'))
  const [loading, setLoading] = useState(false)
  const [customUrl, setCustomUrl] = useState('')

  const loadCategory = useCallback(async (catId: MusicCategoryId) => {
    setCategory(catId)
    music.clearError()
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
  }, [music])

  useEffect(() => {
    let cancelled = false
    const catId: MusicCategoryId = 'lounge'
    const presets = stationsForCategory(catId)
    const cat = MUSIC_CATEGORIES.find((c) => c.id === catId)

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      music.clearError()
      setLoading(true)
      try {
        const online = cat?.search ? await fetchRadioStations(cat.search, 8) : []
        const merged = [...presets]
        for (const s of online) {
          if (!merged.some((m) => m.streamUrl === s.streamUrl)) merged.push(s)
        }
        if (!cancelled) setStations(merged)
      } catch {
        if (!cancelled) setStations(presets)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [music])

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

  const stopPlayback = () => {
    music.stop()
    onClose()
  }

  const playCustom = () => {
    const url = customUrl.trim()
    if (!url) return
    void music.playStation({
      id: 'custom',
      name: 'Własny strumień',
      streamUrl: url.includes('://') ? url : `https://${url}`,
      source: 'preset',
    })
  }

  if (minimized) {
    return (
      <div className="music-mini-bar music-mini-bar-inline" role="region" aria-label={`Muzyka: ${link.label}`}>
        <button type="button" onClick={onExpand} className="music-mini-bar-main" title="Rozwiń odtwarzacz">
          <span
            className={`music-mini-bar-icon ${
              music.playing || music.reconnecting || music.buffering ? 'music-mini-bar-icon-live' : ''
            }`}
          >
            {music.playing ? '♫' : music.reconnecting ? '↻' : '♪'}
          </span>
          <span className="music-mini-bar-text">
            <span className="music-mini-bar-title">{music.current?.name ?? link.label}</span>
            <span className="music-mini-bar-sub">{streamStatusLabel(music)}</span>
          </span>
        </button>
        <button type="button" onClick={() => void music.togglePlay()} className="embed-btn embed-btn-primary music-mini-btn" title={music.playing ? 'Pauza' : 'Odtwórz'}>
          {music.playing ? '⏸' : '▶'}
        </button>
        <button type="button" onClick={onExpand} className="embed-btn music-mini-btn" title="Rozwiń panel">⊞</button>
        <button type="button" onClick={stopPlayback} className="embed-btn music-mini-btn" title="Zatrzymaj">×</button>
      </div>
    )
  }

  return (
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
                {music.current ? (
                  <>
                    <span
                      className={
                        music.playing
                          ? 'text-emerald-400'
                          : music.reconnecting || music.buffering
                            ? 'text-amber-400'
                            : 'text-slate-500'
                      }
                    >
                      {streamLiveIndicator(music)}
                    </span>
                    {music.current.name}
                  </>
                ) : (
                  'Radio i strumienie audio — gra w tle na wszystkich stronach'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => void music.togglePlay()} className="embed-btn embed-btn-primary" title={music.playing ? 'Pauza' : 'Odtwórz'}>
              {music.playing ? '⏸ Pauza' : '▶ Graj'}
            </button>
            <button type="button" onClick={onMinimize} className="embed-btn" title="Minimalizuj (muzyka gra dalej)">▁</button>
            <button type="button" onClick={stopPlayback} className="embed-btn" title="Zatrzymaj">×</button>
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
                value={music.volume}
                onChange={(e) => music.setVolume(Number(e.target.value))}
                className="music-volume-slider"
                aria-label="Głośność"
              />
            </div>
          </div>

          {music.error && <p className="music-error-banner">{music.error}</p>}

          <div className="music-station-list" role="list">
            {loading && <p className="text-xs text-slate-500 px-3 py-2">Ładowanie stacji…</p>}
            {stations.map((station) => (
              <button
                key={station.id}
                type="button"
                role="listitem"
                onClick={() => void music.playStation(station)}
                className={`music-station-row ${music.current?.id === station.id ? 'music-station-row-active' : ''}`}
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
                  {music.current?.id === station.id && (music.playing || music.reconnecting || music.buffering)
                    ? music.reconnecting
                      ? '↻'
                      : music.buffering
                        ? '◌'
                        : '●'
                    : '▶'}
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
            <button type="button" onClick={playCustom} className="embed-btn shrink-0">Odtwórz</button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Pełnoekranowy overlay odtwarzacza — dostępny z paska powłoki. */
export function GlobalMusicOverlay({ onClose }: { onClose?: () => void }) {
  const music = useMusic()
  if (!music.playerExpanded) return null

  const fakeLink: QuickLink = {
    id: 'global-music',
    label: 'Muzyka',
    url: 'music://player',
    linkType: 'music',
    icon: '🎵',
    iconMode: 'manual',
    openMode: 'embed',
    embedSize: 'large',
    color: '#a855f7',
    pinned: false,
  }

  return (
    <div className="global-music-overlay">
      <div className="global-music-overlay-backdrop" onClick={() => { music.setPlayerExpanded(false); onClose?.() }} />
      <div className="global-music-overlay-panel">
        <MusicPanel
          link={fakeLink}
          minimized={false}
          onMinimize={() => music.setPlayerExpanded(false)}
          onExpand={() => {}}
          onClose={() => { music.stop(); music.setPlayerExpanded(false) }}
        />
      </div>
    </div>
  )
}

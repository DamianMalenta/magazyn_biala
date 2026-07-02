import { useCallback, useEffect, useState } from 'react'
import type { QuickLink } from '../types'
import { EMBED_SIZE_HEIGHT } from '../lib/linkOpenUtils'
import {
  MUSIC_CATEGORIES,
  MUSIC_TABS,
  categoriesForTab,
  defaultCategoryForTab,
  inferTabAndCategory,
  isLocalFilesStation,
  stationsForCategory,
  stationsWithOnlineForCategory,
  type MusicCategoryId,
  type MusicStation,
  type MusicTabId,
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

  const initial = inferTabAndCategory(music.current)
  const [tab, setTab] = useState<MusicTabId>(initial.tab)
  const [category, setCategory] = useState<MusicCategoryId>(initial.category)
  const [stations, setStations] = useState<MusicStation[]>(() => stationsForCategory(initial.category))
  const [loading, setLoading] = useState(false)
  const [customUrl, setCustomUrl] = useState('')

  const tabCategories = categoriesForTab(tab)
  const activeTabMeta = MUSIC_TABS.find((t) => t.id === tab)
  const activeCategoryMeta = MUSIC_CATEGORIES.find((c) => c.id === category)
  const isLokalnie = category === 'lokalnie'
  const localReady = music.localMusic.connected
  const needsRestore = music.localMusic.permission === 'prompt'
  const localPlaylistCounts = Object.fromEntries(
    music.localMusic.playlists.map((p) => [p.id, p.trackCount]),
  )

  const loadCategory = useCallback(async (catId: MusicCategoryId) => {
    setCategory(catId)
    music.clearError()
    setStations(stationsForCategory(catId))
    setLoading(true)

    try {
      const merged = await stationsWithOnlineForCategory(catId, 8)
      setStations(merged)
    } catch {
      setStations(stationsForCategory(catId))
    } finally {
      setLoading(false)
    }
  }, [music])

  const loadTab = useCallback(
    async (tabId: MusicTabId) => {
      setTab(tabId)
      const catId = defaultCategoryForTab(tabId)
      await loadCategory(catId)
    },
    [loadCategory],
  )

  useEffect(() => {
    let cancelled = false
    const { tab: initTab, category: initCat } = inferTabAndCategory(music.current)

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      setTab(initTab)
      setCategory(initCat)
      music.clearError()
      setLoading(true)
      setStations(stationsForCategory(initCat))
      try {
        const merged = await stationsWithOnlineForCategory(initCat, 8)
        if (!cancelled) setStations(merged)
      } catch {
        if (!cancelled) setStations(stationsForCategory(initCat))
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
            <div className="music-tabs" role="tablist" aria-label="Typ muzyki">
              {MUSIC_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => void loadTab(t.id)}
                  className={`music-tab-btn ${tab === t.id ? 'music-tab-btn-active' : ''}`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {activeTabMeta && (
              <p className="music-tab-hint">{activeTabMeta.hint}</p>
            )}
            {tabCategories.length > 0 && (
              <div className="music-categories" role="tablist" aria-label="Kategoria">
                {tabCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={category === cat.id}
                    onClick={() => void loadCategory(cat.id)}
                    className={`music-cat-btn ${category === cat.id ? 'music-cat-btn-active' : ''}`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
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

          {isLokalnie && (
            <div className="music-local-setup">
              <p className="music-local-setup-title">Muzyka na tym komputerze</p>
              {!music.localMusic.supported ? (
                <p className="music-local-setup-text">
                  Ta przeglądarka nie obsługuje odtwarzania z folderu. Użyj Chrome lub Edge na komputerze,
                  na którym masz pliki MP3.
                </p>
              ) : (
                <>
                  <ol className="music-local-setup-steps">
                    <li>
                      W terminalu w folderze projektu: <code>npm run download:local-music</code>
                    </li>
                    <li>Kliknij przycisk poniżej i wskaż folder <code>local-music/lokalnie</code></li>
                    <li>
                      Po restarcie komputera kliknij <strong>Przywróć dostęp</strong> (przeglądarka resetuje
                      uprawnienia — nie trzeba szukać folderu od nowa)
                    </li>
                  </ol>
                  {needsRestore ? (
                    <button
                      type="button"
                      className="embed-btn embed-btn-primary music-local-pick-btn"
                      onClick={() => void music.restoreLocalMusicFolder()}
                    >
                      🔓 Przywróć dostęp do folderu
                      {music.localMusic.rememberedFolderName
                        ? ` (${music.localMusic.rememberedFolderName})`
                        : ''}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="embed-btn embed-btn-primary music-local-pick-btn"
                      onClick={() => void music.pickLocalMusicFolder()}
                    >
                      📁 Wybierz folder z muzyką
                    </button>
                  )}
                  {needsRestore && (
                    <p className="music-local-setup-status music-local-setup-status-warn">
                      Folder <strong>{music.localMusic.rememberedFolderName ?? 'z muzyką'}</strong> jest
                      zapamiętany, ale po restarcie komputera przeglądarka wymaga jednego kliknięcia, żeby
                      znów czytać pliki.
                    </p>
                  )}
                  {localReady ? (
                    <p className="music-local-setup-status music-local-setup-status-ok">
                      ✓ Połączono: <strong>{music.localMusic.folderName}</strong> —{' '}
                      {music.localMusic.totalTracks} utworów w {music.localMusic.playlists.length} playlistach
                    </p>
                  ) : !needsRestore ? (
                    <p className="music-local-setup-status">Nie wybrano folderu — playlisty nie zagrają.</p>
                  ) : null}
                </>
              )}
            </div>
          )}

          <div className="music-station-list" role="list">
            {loading && <p className="text-xs text-slate-500 px-3 py-2">Ładowanie stacji…</p>}
            {!loading && stations.length === 0 && category === 'lokalne-kom' && (
              <p className="music-empty-category">
                Brak skonfigurowanych playlist komercyjnych z lokalu.
                {activeCategoryMeta && (
                  <>
                    {' '}
                    Kategoria <strong>{activeCategoryMeta.label}</strong> — dodamy strumienie z PC w lokalu.
                  </>
                )}
              </p>
            )}
            {stations.map((station) => {
              const isLocal = isLocalFilesStation(station)
              const trackCount = isLocal && station.localFolder ? localPlaylistCounts[station.localFolder] : null
              const disabled = isLocal && !localReady

              return (
              <button
                key={station.id}
                type="button"
                role="listitem"
                disabled={disabled}
                onClick={() => void music.playStation(station)}
                className={`music-station-row ${music.current?.id === station.id ? 'music-station-row-active' : ''} ${disabled ? 'music-station-row-disabled' : ''}`}
              >
                {station.favicon ? (
                  <img src={station.favicon} alt="" className="music-station-favicon" />
                ) : (
                  <span className="music-station-favicon music-station-favicon-placeholder">
                    {isLocal ? '💿' : '🎧'}
                  </span>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold truncate">{station.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {trackCount != null
                      ? `${trackCount} utworów · ${station.tags ?? 'playlista lokalna'}`
                      : [station.country, station.tags].filter(Boolean).join(' · ') || 'strumień audio'}
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
            )})}
          </div>

          <details className="music-legal-note">
            <summary>Prawa autorskie w lokalu (ważne)</summary>
            {tab === 'commercial' ? (
              <p>
                <strong>Komercyjne</strong> — <strong>Polskie radio</strong>: RMF, ZET itd. (wymaga ZAiKS/STOART).
                <strong> Lokalne</strong>: własne playlisty z serwera w lokalu.
              </p>
            ) : (
              <p>
                <strong>Niekomercyjne</strong> — <strong>Stacje radiowe</strong>: międzynarodowe strumienie bez
                polskiego radia komercyjnego. <strong>Lokalnie</strong>: playlisty CC0 z folderu na tym komputerze
                — bez opłat OZZ.
              </p>
            )}
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

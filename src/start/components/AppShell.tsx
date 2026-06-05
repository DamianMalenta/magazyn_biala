import { useEffect, useState } from 'react'
import type { QuickLink, WindowsShortcut } from '../types'
import { getEmbedInfo } from '../lib/linkOpenUtils'
import { launchWindowsShortcut } from '../lib/windowsDeploy'
import { LinkIcon } from './LinkIcon'
import { useMusic } from '../context/MusicProvider'

interface ShellToolbarProps {
  link: QuickLink
  companyName: string
  time: string
  pinnedLinks: QuickLink[]
  windowsShortcuts: WindowsShortcut[]
  onBack: () => void
  onSwitchLink: (link: QuickLink) => void
  onOpenExternal: () => void
  onToggleFullscreen: () => void
  fullscreenActive: boolean
}

export function ShellToolbar({
  link,
  companyName,
  time,
  pinnedLinks,
  windowsShortcuts,
  onBack,
  onSwitchLink,
  onOpenExternal,
  onToggleFullscreen,
  fullscreenActive,
}: ShellToolbarProps) {
  const music = useMusic()
  const enabledShortcuts = windowsShortcuts.filter((s) => s.enabled)

  const handleShortcut = (shortcut: WindowsShortcut) => {
    if (shortcut.targetType === 'info') {
      window.alert(shortcut.description ?? shortcut.target)
      return
    }
    const ok = launchWindowsShortcut(shortcut.target, shortcut.targetType)
    if (!ok) window.alert(`Nie udało się uruchomić: ${shortcut.label}`)
  }

  return (
    <header className="shell-toolbar">
      <div className="shell-toolbar-zone shell-toolbar-left">
        <button type="button" onClick={onBack} className="shell-btn shell-btn-back" title="Powrót do panelu">
          <span className="shell-btn-icon">←</span>
          <span className="shell-btn-label">Panel</span>
        </button>
        <div className="shell-title-block">
          <LinkIcon link={link} size="shell" />
          <div className="min-w-0">
            <p className="shell-title">{link.label}</p>
            <p className="shell-subtitle">{companyName}</p>
          </div>
        </div>
      </div>

      <nav className="shell-toolbar-zone shell-toolbar-nav" aria-label="Szybkie przełączanie">
        {pinnedLinks.slice(0, 8).map((l) => {
          const active = l.id === link.id
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSwitchLink(l)}
              className={`shell-nav-pill ${active ? 'shell-nav-pill-active' : ''}`}
              title={l.label}
              style={{ '--pill-accent': l.color } as React.CSSProperties}
            >
              <LinkIcon link={l} size="shellNav" />
              <span className="shell-nav-label">{l.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="shell-toolbar-zone shell-toolbar-right">
        {enabledShortcuts.length > 0 && (
          <div className="shell-win-shortcuts">
            {enabledShortcuts.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleShortcut(s)}
                className="shell-btn shell-btn-icon-only"
                title={s.description ?? s.label}
              >
                {s.icon}
              </button>
            ))}
          </div>
        )}

        <div className="shell-music-cluster">
          <button
            type="button"
            onClick={() => music.setPlayerExpanded(true)}
            className={`shell-music-btn ${music.playing ? 'shell-music-btn-live' : ''}`}
            title={music.current?.name ?? 'Muzyka w tle'}
          >
            <span>{music.playing ? '♫' : '♪'}</span>
            <span className="shell-music-label">{music.current?.name ?? 'Muzyka'}</span>
          </button>
          <button type="button" onClick={() => void music.togglePlay()} className="shell-btn shell-btn-icon-only" title={music.playing ? 'Pauza' : 'Odtwórz'}>
            {music.playing ? '⏸' : '▶'}
          </button>
        </div>

        <span className="shell-clock">{time}</span>

        <button type="button" onClick={onOpenExternal} className="shell-btn shell-btn-icon-only" title="Otwórz w nowej karcie">
          ↗
        </button>
        <button type="button" onClick={onToggleFullscreen} className="shell-btn shell-btn-icon-only" title={fullscreenActive ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}>
          {fullscreenActive ? '⤢' : '⛶'}
        </button>
      </div>
    </header>
  )
}

interface AppShellProps {
  link: QuickLink
  companyName: string
  time: string
  pinnedLinks: QuickLink[]
  windowsShortcuts: WindowsShortcut[]
  onBack: () => void
  onSwitchLink: (link: QuickLink) => void
  onToggleFullscreen: () => void
  fullscreenActive: boolean
}

export function AppShell({
  link,
  companyName,
  time,
  pinnedLinks,
  windowsShortcuts,
  onBack,
  onSwitchLink,
  onToggleFullscreen,
  fullscreenActive,
}: AppShellProps) {
  const embed = getEmbedInfo(link.url)
  const [iframeBlocked, setIframeBlocked] = useState(false)

  useEffect(() => {
    setIframeBlocked(false)
  }, [link.id, link.url])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBack])

  const openExternal = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const showIframe = embed.kind === 'iframe' && embed.url && !iframeBlocked

  return (
    <div className="app-shell">
      <ShellToolbar
        link={link}
        companyName={companyName}
        time={time}
        pinnedLinks={pinnedLinks}
        windowsShortcuts={windowsShortcuts}
        onBack={onBack}
        onSwitchLink={onSwitchLink}
        onOpenExternal={openExternal}
        onToggleFullscreen={onToggleFullscreen}
        fullscreenActive={fullscreenActive}
      />

      <div className="app-shell-body">
        {!embed.supportsEmbed || !showIframe ? (
          <div className="app-shell-fallback">
            <p className="text-4xl mb-3">🚫</p>
            <p className="font-bold text-lg mb-2">Strona blokuje podgląd w panelu</p>
            <p className="text-sm text-slate-400 mb-6 max-w-md text-center">
              {embed.hint ?? 'Facebook, banki i wiele systemów POS nie pozwalają na osadzenie. Otwórz pełną stronę — muzyka z panelu gra dalej w tle.'}
            </p>
            <button type="button" onClick={openExternal} className="embed-btn embed-btn-primary px-8 py-3 text-sm">
              ↗ Otwórz pełną stronę
            </button>
          </div>
        ) : (
          <>
            {embed.hint && (
              <p className="app-shell-hint">{embed.hint}</p>
            )}
            <iframe
              key={link.id + embed.url}
              src={embed.url}
              title={link.label}
              className="app-shell-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onError={() => setIframeBlocked(true)}
            />
          </>
        )}
      </div>
    </div>
  )
}

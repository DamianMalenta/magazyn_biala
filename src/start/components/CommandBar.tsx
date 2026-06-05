import type { QuickLink, WindowsShortcut } from '../types'
import type { WorkspaceTab } from '../hooks/useWorkspace'
import { launchWindowsShortcut } from '../lib/windowsDeploy'
import { LinkIcon } from './LinkIcon'
import { useMusic } from '../context/MusicProvider'

interface CommandBarProps {
  companyName: string
  time: string
  tabs: WorkspaceTab[]
  activeId: string | null
  quickLinks: QuickLink[]
  windowsShortcuts: WindowsShortcut[]
  openHandoverCount: number
  barPosition: 'top' | 'bottom'
  onBack: () => void
  onSwitchTab: (linkId: string) => void
  onCloseTab: (linkId: string) => void
  onOpenLink: (link: QuickLink) => void
  onOpenAdmin: () => void
  onToggleFullscreen: () => void
  fullscreenActive: boolean
}

export function CommandBar({
  companyName,
  time,
  tabs,
  activeId,
  quickLinks,
  windowsShortcuts,
  openHandoverCount,
  barPosition,
  onBack,
  onSwitchTab,
  onCloseTab,
  onOpenLink,
  onOpenAdmin,
  onToggleFullscreen,
  fullscreenActive,
}: CommandBarProps) {
  const music = useMusic()
  const enabledShortcuts = windowsShortcuts.filter((s) => s.enabled)
  const activeTab = tabs.find((t) => t.link.id === activeId)
  const pinned = quickLinks.filter((l) => l.pinned)

  const handleShortcut = (shortcut: WindowsShortcut) => {
    if (shortcut.targetType === 'info') {
      window.alert(shortcut.description ?? shortcut.target)
      return
    }
    launchWindowsShortcut(shortcut.target, shortcut.targetType)
  }

  return (
    <header className={`command-bar command-bar-${barPosition}`}>
      <div className="command-bar-zone command-bar-left">
        <button type="button" onClick={onBack} className="shell-btn shell-btn-back" title="Ekran główny lokalu">
          <span className="shell-btn-icon">←</span>
          <span className="shell-btn-label hidden sm:inline">Ekran główny</span>
        </button>
        <div className="command-bar-brand">
          <span className="command-bar-brand-name">{companyName}</span>
          {activeTab && <span className="command-bar-active-label">{activeTab.link.label}</span>}
        </div>
      </div>

      <nav className="command-bar-zone command-bar-tabs" aria-label="Otwarte skróty">
        {tabs.map(({ link }) => {
          const active = link.id === activeId
          return (
            <div key={link.id} className={`command-tab ${active ? 'command-tab-active' : ''}`}>
              <button
                type="button"
                onClick={() => onSwitchTab(link.id)}
                className="command-tab-main"
                title={link.label}
                style={{ '--tab-accent': link.color } as React.CSSProperties}
              >
                <LinkIcon link={link} size="shellNav" />
                <span className="command-tab-label">{link.label}</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCloseTab(link.id) }}
                className="command-tab-close"
                title="Zamknij"
              >
                ×
              </button>
            </div>
          )
        })}
        {pinned.length > tabs.length && (
          <div className="command-bar-add-wrap">
            <select
              className="command-bar-add-select"
              value=""
              onChange={(e) => {
                const link = pinned.find((l) => l.id === e.target.value)
                if (link) onOpenLink(link)
                e.target.value = ''
              }}
              aria-label="Otwórz skrót"
            >
              <option value="">+ Skrót</option>
              {pinned
                .filter((l) => !tabs.some((t) => t.link.id === l.id))
                .map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
            </select>
          </div>
        )}
      </nav>

      <div className="command-bar-zone command-bar-right">
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

        {openHandoverCount > 0 && (
          <button type="button" onClick={onBack} className="command-bar-badge" title="Otwarte przekazania — wróć do ekranu głównego">
            📌 {openHandoverCount}
          </button>
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

        <button type="button" onClick={onToggleFullscreen} className="shell-btn shell-btn-icon-only" title={fullscreenActive ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}>
          {fullscreenActive ? '⤢' : '⛶'}
        </button>

        <button type="button" onClick={onOpenAdmin} className="shell-btn shell-btn-icon-only" title="Panel admina">
          ⚙
        </button>
      </div>
    </header>
  )
}

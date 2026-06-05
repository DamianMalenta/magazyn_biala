import { useEffect } from 'react'
import type { QuickLink, WindowsShortcut } from '../types'
import type { WorkspaceTab } from '../hooks/useWorkspace'
import { resolveShellFrameUrl } from '../lib/internalLinks'
import { openLinkInTab } from '../lib/linkOpenUtils'
import { CommandBar } from './CommandBar'

interface WorkspaceShellProps {
  companyName: string
  time: string
  tabs: WorkspaceTab[]
  activeTab: WorkspaceTab | null
  activeId: string | null
  quickLinks: QuickLink[]
  windowsShortcuts: WindowsShortcut[]
  openHandoverCount: number
  barHeight: number
  barPosition: 'top' | 'bottom'
  onBack: () => void
  onSwitchTab: (linkId: string) => void
  onCloseTab: (linkId: string) => void
  onOpenLink: (link: QuickLink) => void
  onOpenAdmin: () => void
  onToggleFullscreen: () => void
  fullscreenActive: boolean
}

export function WorkspaceShell({
  companyName,
  time,
  tabs,
  activeTab,
  activeId,
  quickLinks,
  windowsShortcuts,
  openHandoverCount,
  barHeight,
  barPosition,
  onBack,
  onSwitchTab,
  onCloseTab,
  onOpenLink,
  onOpenAdmin,
  onToggleFullscreen,
  fullscreenActive,
}: WorkspaceShellProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBack])

  const bar = (
    <CommandBar
      companyName={companyName}
      time={time}
      tabs={tabs}
      activeId={activeId}
      quickLinks={quickLinks}
      windowsShortcuts={windowsShortcuts}
      openHandoverCount={openHandoverCount}
      barPosition={barPosition}
      onBack={onBack}
      onSwitchTab={onSwitchTab}
      onCloseTab={onCloseTab}
      onOpenLink={onOpenLink}
      onOpenAdmin={onOpenAdmin}
      onToggleFullscreen={onToggleFullscreen}
      fullscreenActive={fullscreenActive}
    />
  )

  const content = activeTab ? (
    <div className="workspace-frame">
      <iframe
        key={activeTab.link.id}
        src={resolveShellFrameUrl(activeTab.link.url)}
        title={activeTab.link.label}
        className="workspace-iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="workspace-frame-actions">
        <button
          type="button"
          onClick={() => openLinkInTab(activeTab.link.url)}
          className="workspace-frame-action-btn"
          title="Otwórz w nowej karcie Chrome"
        >
          ↗ Nowa karta
        </button>
      </div>
    </div>
  ) : (
    <div className="workspace-empty">
      <p className="text-slate-500 text-sm">Wybierz skrót z paska powyżej lub otwórz nowy z listy + Skrót</p>
    </div>
  )

  return (
    <div
      className={`workspace-shell workspace-shell-${barPosition}`}
      style={{ '--bar-h': `${barHeight}px` } as React.CSSProperties}
    >
      {barPosition === 'top' ? (
        <>
          {bar}
          <div className="workspace-content">{content}</div>
        </>
      ) : (
        <>
          <div className="workspace-content">{content}</div>
          {bar}
        </>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import type { QuickLink, WindowsShortcut } from '../types'
import type { WorkspaceTab } from '../hooks/useWorkspace'
import { resolveInternalEmbedUrl } from '../lib/internalLinks'
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
  onFocusExternal: () => void
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
  onFocusExternal,
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
      onFocusExternal={onFocusExternal}
      onOpenAdmin={onOpenAdmin}
      onToggleFullscreen={onToggleFullscreen}
      fullscreenActive={fullscreenActive}
    />
  )

  const content = activeTab ? (
    activeTab.kind === 'internal' ? (
      <iframe
        key={activeTab.link.id}
        src={resolveInternalEmbedUrl(activeTab.link.url.trim())}
        title={activeTab.link.label}
        className="workspace-iframe"
        allow="clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    ) : (
      <div className="workspace-external-slot">
        <div className="workspace-external-card">
          <p className="text-3xl mb-3">{activeTab.link.icon}</p>
          <p className="font-bold text-lg mb-2">{activeTab.link.label}</p>
          <p className="text-sm text-slate-400 mb-6 max-w-md text-center leading-relaxed">
            Pełna strona otwarta <strong>pod paskiem ekranu głównego</strong> — bez iframe, bez blokad.
            Muzyka z ekranu głównego gra dalej.
          </p>
          <button type="button" onClick={onFocusExternal} className="embed-btn embed-btn-primary px-8 py-3 text-sm">
            ↗ Przełącz na {activeTab.link.label}
          </button>
        </div>
      </div>
    )
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

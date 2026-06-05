import { useCallback, useEffect, useRef, useState } from 'react'
import type { QuickLink, WorkspaceSettings } from '../types'
import { isInternalModuleUrl } from '../lib/internalLinks'
import {
  closeDockedWindow,
  DEFAULT_BAR_HEIGHT,
  dockWindowName,
  focusDockedWindow,
  hideDockedWindow,
  openDockedContent,
} from '../lib/dockedWindow'

export type WorkspaceTabKind = 'internal' | 'external'

export interface WorkspaceTab {
  link: QuickLink
  kind: WorkspaceTabKind
}

export function useWorkspace(workspace: WorkspaceSettings) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const dockWindows = useRef<Map<string, Window>>(new Map())

  const barHeight = workspace.barHeight ?? DEFAULT_BAR_HEIGHT
  const barPosition = workspace.barPosition ?? 'top'
  const isActive = tabs.length > 0

  const activeTab = tabs.find((t) => t.link.id === activeId) ?? tabs[tabs.length - 1] ?? null

  const syncDockVisibility = useCallback(
    (nextActiveId: string | null, tabList: WorkspaceTab[]) => {
      for (const tab of tabList) {
        if (tab.kind !== 'external') continue
        const win = dockWindows.current.get(tab.link.id) ?? null
        if (tab.link.id === nextActiveId) {
          if (!win || win.closed) {
            const opened = openDockedContent(tab.link.url, tab.link.id, barHeight, barPosition)
            if (opened) dockWindows.current.set(tab.link.id, opened)
          } else {
            focusDockedWindow(win, barHeight, barPosition)
          }
        } else {
          hideDockedWindow(win)
        }
      }
    },
    [barHeight, barPosition],
  )

  const openTab = useCallback(
    (link: QuickLink) => {
      const kind: WorkspaceTabKind = isInternalModuleUrl(link.url) ? 'internal' : 'external'

      setTabs((prev) => {
        const exists = prev.some((t) => t.link.id === link.id)
        const next = exists ? prev : [...prev, { link, kind }]
        syncDockVisibility(link.id, next)
        return next
      })
      setActiveId(link.id)
    },
    [syncDockVisibility],
  )

  const switchTab = useCallback(
    (linkId: string) => {
      setActiveId(linkId)
      setTabs((prev) => {
        syncDockVisibility(linkId, prev)
        return prev
      })
    },
    [syncDockVisibility],
  )

  const closeTab = useCallback(
    (linkId: string) => {
      closeDockedWindow(dockWindows.current.get(linkId) ?? null)
      dockWindows.current.delete(linkId)

      setTabs((prev) => {
        const next = prev.filter((t) => t.link.id !== linkId)
        const nextActive =
          activeId === linkId ? (next[next.length - 1]?.link.id ?? null) : activeId
        setActiveId(nextActive)
        if (nextActive) syncDockVisibility(nextActive, next)
        return next
      })
    },
    [activeId, syncDockVisibility],
  )

  const closeWorkspace = useCallback(() => {
    for (const win of dockWindows.current.values()) {
      closeDockedWindow(win)
    }
    dockWindows.current.clear()
    setTabs([])
    setActiveId(null)
  }, [])

  const focusExternal = useCallback(() => {
    if (!activeTab || activeTab.kind !== 'external') return
    const win = dockWindows.current.get(activeTab.link.id)
    if (!win || win.closed) {
      const opened = openDockedContent(activeTab.link.url, activeTab.link.id, barHeight, barPosition)
      if (opened) dockWindows.current.set(activeTab.link.id, opened)
    } else {
      focusDockedWindow(win, barHeight, barPosition)
    }
  }, [activeTab, barHeight, barPosition])

  useEffect(() => {
    const onResize = () => {
      if (!activeId) return
      syncDockVisibility(activeId, tabs)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeId, tabs, syncDockVisibility])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTabs((prev) => {
        let changed = false
        const next = prev.filter((tab) => {
          if (tab.kind !== 'external') return true
          const win = dockWindows.current.get(tab.link.id)
          if (win && win.closed) {
            dockWindows.current.delete(tab.link.id)
            changed = true
            return false
          }
          return true
        })
        if (changed && activeId && !next.some((t) => t.link.id === activeId)) {
          setActiveId(next[next.length - 1]?.link.id ?? null)
        }
        return changed ? next : prev
      })
    }, 800)
    return () => window.clearInterval(interval)
  }, [activeId])

  useEffect(() => () => {
    for (const win of dockWindows.current.values()) {
      closeDockedWindow(win)
    }
  }, [])

  return {
    tabs,
    activeTab,
    activeId,
    isActive,
    openTab,
    switchTab,
    closeTab,
    closeWorkspace,
    focusExternal,
    barHeight,
    barPosition,
    dockWindowName,
  }
}

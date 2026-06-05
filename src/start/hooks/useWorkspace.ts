import { useCallback, useState } from 'react'
import type { QuickLink, WorkspaceSettings } from '../types'
import { DEFAULT_BAR_HEIGHT } from '../lib/workspaceConstants'

export interface WorkspaceTab {
  link: QuickLink
}

export function useWorkspace(workspace: WorkspaceSettings) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const barHeight = workspace.barHeight ?? DEFAULT_BAR_HEIGHT
  const barPosition = workspace.barPosition ?? 'top'
  const isActive = tabs.length > 0

  const activeTab = tabs.find((t) => t.link.id === activeId) ?? tabs[tabs.length - 1] ?? null

  const openTab = useCallback((link: QuickLink) => {
    setTabs((prev) => {
      const exists = prev.some((t) => t.link.id === link.id)
      return exists ? prev : [...prev, { link }]
    })
    setActiveId(link.id)
  }, [])

  const switchTab = useCallback((linkId: string) => {
    setActiveId(linkId)
  }, [])

  const closeTab = useCallback(
    (linkId: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.link.id !== linkId)
        if (activeId === linkId) {
          setActiveId(next[next.length - 1]?.link.id ?? null)
        }
        return next
      })
    },
    [activeId],
  )

  const closeWorkspace = useCallback(() => {
    setTabs([])
    setActiveId(null)
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
    barHeight,
    barPosition,
  }
}

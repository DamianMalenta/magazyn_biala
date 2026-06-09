import { useCallback, useState } from 'react'
import type { QuickLink, WorkspaceSettings } from '../types'
import { openLinkInTab, openLinkInWindow, resolveLinkOpenMode } from '../lib/linkOpenUtils'
import { isMusicLink } from '../lib/musicUtils'
import { useWorkspace } from './useWorkspace'

interface EmbedState {
  link: QuickLink | null
  minimized: boolean
}

const CLOSED: EmbedState = { link: null, minimized: false }

export function useLinkOpener(workspace: WorkspaceSettings) {
  const [embedState, setEmbedState] = useState<EmbedState>(CLOSED)
  const ws = useWorkspace(workspace)

  const leaveWorkspace = useCallback(() => {
    if (ws.isActive) ws.closeWorkspace()
  }, [ws])

  const openLink = useCallback(
    (link: QuickLink) => {
      const mode = resolveLinkOpenMode(link, workspace.defaultLinkOpenMode)

      if (isMusicLink(link.url, link.linkType)) {
        if (mode === 'tab') {
          leaveWorkspace()
          setEmbedState(CLOSED)
          openLinkInTab(link.url)
          return
        }
        if (mode === 'window') {
          leaveWorkspace()
          setEmbedState(CLOSED)
          openLinkInWindow(link.url, link.label)
          return
        }
        if (mode === 'shell') {
          leaveWorkspace()
          setEmbedState({ link, minimized: false })
          return
        }
        leaveWorkspace()
        setEmbedState((prev) => {
          if (prev.link?.id === link.id) {
            return { link: prev.link, minimized: !prev.minimized }
          }
          return { link, minimized: false }
        })
        return
      }

      if (mode === 'shell') {
        setEmbedState(CLOSED)
        ws.openTab(link)
        return
      }

      leaveWorkspace()
      setEmbedState(CLOSED)

      if (mode === 'tab') {
        openLinkInTab(link.url)
        return
      }

      if (mode === 'window') {
        openLinkInWindow(link.url, link.label)
        return
      }

      if (mode === 'embed') {
        setEmbedState((prev) => {
          if (prev.link?.id === link.id) return CLOSED
          return { link, minimized: false }
        })
      }
    },
    [leaveWorkspace, ws, workspace.defaultLinkOpenMode],
  )

  const closeEmbed = useCallback(() => setEmbedState(CLOSED), [])

  const minimizeEmbed = useCallback(() => {
    setEmbedState((prev) => (prev.link ? { ...prev, minimized: true } : prev))
  }, [])

  const expandEmbed = useCallback(() => {
    setEmbedState((prev) => (prev.link ? { ...prev, minimized: false } : prev))
  }, [])

  const openEmbeddedInTab = useCallback(() => {
    setEmbedState((prev) => {
      if (prev.link) openLinkInTab(prev.link.url)
      return CLOSED
    })
  }, [])

  const openShellInNewTab = useCallback(() => {
    const tab = ws.activeTab
    if (!tab) return
    ws.closeWorkspace()
    openLinkInTab(tab.link.url)
  }, [ws])

  const exitWorkspace = useCallback(() => {
    ws.closeWorkspace()
  }, [ws])

  return {
    openLink,
    embeddedLink: embedState.link,
    embedMinimized: embedState.minimized,
    closeEmbed,
    minimizeEmbed,
    expandEmbed,
    openEmbeddedInTab,
    openShellInNewTab,
    exitWorkspace,
    workspace: ws,
  }
}

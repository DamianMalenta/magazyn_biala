import { useCallback, useState } from 'react'
import type { QuickLink, WorkspaceSettings } from '../types'
import { openLinkInWindow } from '../lib/linkOpenUtils'
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

  const openLink = useCallback(
    (link: QuickLink) => {
      const mode = link.openMode ?? 'shell'

      if (isMusicLink(link.url, link.linkType)) {
        if (mode === 'tab') {
          window.open(link.url, '_blank', 'noopener,noreferrer')
          return
        }
        if (mode === 'window') {
          openLinkInWindow(link.url, link.label)
          return
        }
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

      if (mode === 'tab') {
        window.open(link.url, '_blank', 'noopener,noreferrer')
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
    [ws],
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
      if (prev.link) {
        window.open(prev.link.url, '_blank', 'noopener,noreferrer')
      }
      return CLOSED
    })
  }, [])

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
    exitWorkspace,
    workspace: ws,
  }
}

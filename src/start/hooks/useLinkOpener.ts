import { useCallback, useState } from 'react'
import type { QuickLink } from '../types'
import { openLinkInWindow } from '../lib/linkOpenUtils'
import { isMusicLink } from '../lib/musicUtils'

interface EmbedState {
  link: QuickLink | null
  minimized: boolean
}

const CLOSED: EmbedState = { link: null, minimized: false }

export function useLinkOpener() {
  const [embedState, setEmbedState] = useState<EmbedState>(CLOSED)
  const [shellLink, setShellLink] = useState<QuickLink | null>(null)

  const openLink = useCallback((link: QuickLink) => {
    const mode = link.openMode ?? 'shell'

    if (isMusicLink(link.url, link.linkType)) {
      if (mode === 'shell') {
        setShellLink(null)
      }
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
      setShellLink(link)
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
      setShellLink(null)
      setEmbedState((prev) => {
        if (prev.link?.id === link.id) return CLOSED
        return { link, minimized: false }
      })
    }
  }, [])

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

  const closeShell = useCallback(() => setShellLink(null), [])

  const switchShellLink = useCallback((link: QuickLink) => {
    if (isMusicLink(link.url, link.linkType)) {
      setShellLink(null)
      setEmbedState({ link, minimized: false })
      return
    }
    setEmbedState(CLOSED)
    setShellLink(link)
  }, [])

  return {
    openLink,
    embeddedLink: embedState.link,
    embedMinimized: embedState.minimized,
    shellLink,
    closeEmbed,
    minimizeEmbed,
    expandEmbed,
    openEmbeddedInTab,
    closeShell,
    switchShellLink,
  }
}

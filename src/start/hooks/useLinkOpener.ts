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

  const openLink = useCallback((link: QuickLink) => {
    const mode = link.openMode ?? 'tab'

    if (mode === 'tab') {
      window.open(link.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (mode === 'window') {
      openLinkInWindow(link.url, link.label)
      return
    }

    if (mode === 'embed') {
      const isMusic = isMusicLink(link.url, link.linkType)

      setEmbedState((prev) => {
        if (isMusic) {
          if (prev.link?.id === link.id) {
            return { link: prev.link, minimized: !prev.minimized }
          }
          return { link, minimized: false }
        }

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

  return {
    openLink,
    embeddedLink: embedState.link,
    embedMinimized: embedState.minimized,
    closeEmbed,
    minimizeEmbed,
    expandEmbed,
    openEmbeddedInTab,
  }
}

import { useCallback, useState } from 'react'
import type { QuickLink } from '../types'
import { openLinkInWindow } from '../lib/linkOpenUtils'
import { isMusicLink } from '../lib/musicUtils'

export function useLinkOpener() {
  const [embeddedLink, setEmbeddedLink] = useState<QuickLink | null>(null)
  const [embedMinimized, setEmbedMinimized] = useState(false)

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

      if (isMusic) {
        setEmbeddedLink((prev) => {
          if (prev?.id === link.id) {
            setEmbedMinimized((m) => !m)
            return prev
          }
          setEmbedMinimized(false)
          return link
        })
        return
      }

      setEmbedMinimized(false)
      setEmbeddedLink((prev) => (prev?.id === link.id ? null : link))
    }
  }, [])

  const closeEmbed = useCallback(() => {
    setEmbeddedLink(null)
    setEmbedMinimized(false)
  }, [])

  const minimizeEmbed = useCallback(() => setEmbedMinimized(true), [])

  const expandEmbed = useCallback(() => setEmbedMinimized(false), [])

  const openEmbeddedInTab = useCallback(() => {
    if (embeddedLink) {
      window.open(embeddedLink.url, '_blank', 'noopener,noreferrer')
      setEmbeddedLink(null)
      setEmbedMinimized(false)
    }
  }, [embeddedLink])

  return {
    openLink,
    embeddedLink,
    embedMinimized,
    closeEmbed,
    minimizeEmbed,
    expandEmbed,
    openEmbeddedInTab,
  }
}

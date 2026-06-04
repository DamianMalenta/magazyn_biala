import { useCallback, useState } from 'react'
import type { QuickLink } from '../types'
import { openLinkInWindow } from '../lib/linkOpenUtils'

export function useLinkOpener() {
  const [embeddedLink, setEmbeddedLink] = useState<QuickLink | null>(null)

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
      setEmbeddedLink((prev) => (prev?.id === link.id ? null : link))
    }
  }, [])

  const closeEmbed = useCallback(() => setEmbeddedLink(null), [])

  const openEmbeddedInTab = useCallback(() => {
    if (embeddedLink) {
      window.open(embeddedLink.url, '_blank', 'noopener,noreferrer')
      setEmbeddedLink(null)
    }
  }, [embeddedLink])

  return { openLink, embeddedLink, closeEmbed, openEmbeddedInTab }
}

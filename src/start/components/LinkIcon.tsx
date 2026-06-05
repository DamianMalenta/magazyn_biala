import { useEffect, useMemo, useState } from 'react'
import type { QuickLink } from '../types'
import { getFaviconCandidates, hasValidIconUrl, usesAutoIcon } from '../lib/faviconUtils'

type LinkIconSize = 'tile' | 'tileCompact' | 'preview' | 'command' | 'shell' | 'shellNav'

const SIZE_CLASS: Record<LinkIconSize, string> = {
  tile: 'w-14 h-14 md:w-16 md:h-16 rounded-2xl',
  tileCompact: 'w-10 h-10 md:w-11 md:h-11 rounded-xl',
  preview: 'w-10 h-10 rounded-xl',
  command: 'w-6 h-6 rounded-md',
  shell: 'w-8 h-8 rounded-lg',
  shellNav: 'w-5 h-5 rounded-md',
}

const EMOJI_CLASS: Record<LinkIconSize, string> = {
  tile: 'text-5xl md:text-6xl drop-shadow-lg',
  tileCompact: 'text-2xl md:text-3xl leading-none drop-shadow',
  preview: 'text-3xl',
  command: 'text-xl',
  shell: 'text-xl',
  shellNav: 'text-sm leading-none',
}

const FAVICON_SIZE: Record<LinkIconSize, number> = {
  tile: 128,
  tileCompact: 64,
  preview: 64,
  command: 32,
  shell: 48,
  shellNav: 32,
}

interface LinkIconProps {
  link: QuickLink
  size?: LinkIconSize
  className?: string
}

export function LinkIcon({ link, size = 'tile', className = '' }: LinkIconProps) {
  const auto = usesAutoIcon(link)
  const candidates = useMemo(
    () => getFaviconCandidates(link.url, FAVICON_SIZE[size]),
    [link.url, size],
  )

  const [candidateIndex, setCandidateIndex] = useState(0)
  const [exhausted, setExhausted] = useState(false)

  useEffect(() => {
    setCandidateIndex(0)
    setExhausted(false)
  }, [link.url, link.iconMode, candidates.length])

  const showFavicon = auto && !exhausted && candidates.length > 0 && hasValidIconUrl(link.url)
  const src = showFavicon ? candidates[candidateIndex] : null

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((i) => i + 1)
    } else {
      setExhausted(true)
    }
  }

  if (showFavicon && src) {
    return (
      <img
        key={src}
        src={src}
        alt=""
        draggable={false}
        referrerPolicy="no-referrer"
        className={`object-contain bg-white/90 p-1.5 shadow-lg ${SIZE_CLASS[size]} ${className}`}
        onError={handleError}
      />
    )
  }

  return (
    <span className={`${EMOJI_CLASS[size]} ${className}`} role="img" aria-hidden>
      {link.icon || '🔗'}
    </span>
  )
}

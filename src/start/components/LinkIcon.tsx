import { useState } from 'react'
import type { QuickLink } from '../types'
import { getFaviconUrl, usesAutoIcon } from '../lib/faviconUtils'

type LinkIconSize = 'tile' | 'preview' | 'command'

const SIZE_CLASS: Record<LinkIconSize, string> = {
  tile: 'w-14 h-14 md:w-16 md:h-16 rounded-2xl',
  preview: 'w-10 h-10 rounded-xl',
  command: 'w-6 h-6 rounded-md',
}

const EMOJI_CLASS: Record<LinkIconSize, string> = {
  tile: 'text-5xl md:text-6xl drop-shadow-lg',
  preview: 'text-3xl',
  command: 'text-xl',
}

interface LinkIconProps {
  link: QuickLink
  size?: LinkIconSize
  className?: string
}

export function LinkIcon({ link, size = 'tile', className = '' }: LinkIconProps) {
  const [failed, setFailed] = useState(false)
  const auto = usesAutoIcon(link) && !failed
  const favicon = getFaviconUrl(link.url, size === 'tile' ? 128 : 64)

  if (auto && favicon) {
    return (
      <img
        src={favicon}
        alt=""
        draggable={false}
        className={`object-contain bg-white/90 p-1.5 shadow-lg ${SIZE_CLASS[size]} ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span className={`${EMOJI_CLASS[size]} ${className}`} role="img" aria-hidden>
      {link.icon || '🔗'}
    </span>
  )
}

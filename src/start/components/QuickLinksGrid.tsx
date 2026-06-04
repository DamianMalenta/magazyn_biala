import type { QuickLink } from '../types'
import { LinkIcon } from './LinkIcon'

interface QuickLinksGridProps {
  links: QuickLink[]
}

export function QuickLinksGrid({ links }: QuickLinksGridProps) {
  const pinned = links.filter((l) => l.pinned)

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {pinned.map((link, index) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-tile glass group"
        >
          <div className="link-tile-glow" style={{ background: link.color }} />
          <div className="float-gentle relative" style={{ animationDelay: `${index * 0.3}s` }}>
            <LinkIcon link={link} size="tile" />
          </div>
          <span className="text-sm md:text-base font-bold tracking-wide text-white/90 group-hover:text-white">
            {link.label}
          </span>
        </a>
      ))}
    </section>
  )
}

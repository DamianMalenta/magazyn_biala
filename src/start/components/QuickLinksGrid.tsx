import type { QuickLink } from '../types'

interface QuickLinksGridProps {
  links: QuickLink[]
}

export function QuickLinksGrid({ links }: QuickLinksGridProps) {
  const pinned = links.filter((l) => l.pinned)

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {pinned.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-tile glass group"
          style={{ '--tile-color': link.color } as React.CSSProperties}
        >
          <div className="link-tile-glow" style={{ background: link.color }} />
          <span
            className="text-5xl md:text-6xl drop-shadow-lg float-gentle"
            style={{ animationDelay: `${pinned.indexOf(link) * 0.3}s` }}
          >
            {link.icon}
          </span>
          <span className="text-sm md:text-base font-bold tracking-wide text-white/90 group-hover:text-white">
            {link.label}
          </span>
        </a>
      ))}
    </section>
  )
}

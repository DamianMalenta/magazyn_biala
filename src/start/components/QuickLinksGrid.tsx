import type { QuickLink } from '../types'
import { LinkIcon } from './LinkIcon'

interface QuickLinksGridProps {
  links: QuickLink[]
}

export function QuickLinksGrid({ links }: QuickLinksGridProps) {
  const pinned = links.filter((l) => l.pinned)
  if (pinned.length === 0) return null

  return (
    <section className="links-dock-wrap">
      <p className="links-dock-label">Szybki dostęp</p>
      <div className="links-dock">
        {pinned.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-tile-dock group"
            title={link.label}
          >
            <div className="link-tile-dock-icon" style={{ '--tile-accent': link.color } as React.CSSProperties}>
              <div className="link-tile-dock-glow" style={{ background: link.color }} />
              <LinkIcon link={link} size="tile" />
            </div>
            <span className="link-tile-dock-label">{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

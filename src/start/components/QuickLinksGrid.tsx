import type { QuickLink } from '../types'
import { LinkIcon } from './LinkIcon'

interface QuickLinksGridProps {
  links: QuickLink[]
  activeEmbedId?: string | null
  onOpenLink: (link: QuickLink) => void
}

const OPEN_MODE_BADGE: Partial<Record<QuickLink['openMode'], string>> = {
  embed: '⊞',
  window: '⧉',
}

export function QuickLinksGrid({ links, activeEmbedId, onOpenLink }: QuickLinksGridProps) {
  const pinned = links.filter((l) => l.pinned)
  if (pinned.length === 0) return null

  return (
    <section className="links-dock-wrap links-dock-wrap-compact">
      <p className="links-dock-label">Szybki dostęp</p>
      <div className="links-dock links-dock-compact">
        {pinned.map((link) => {
          const isActive = activeEmbedId === link.id && (link.openMode ?? 'tab') === 'embed'
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => onOpenLink(link)}
              className={`link-tile-dock group ${isActive ? 'link-tile-dock-active' : ''}`}
              title={`${link.label}${link.openMode === 'tab' ? '' : ` · ${link.openMode === 'embed' ? 'Panel' : 'Okno'}`}${isActive ? ' · kliknij aby zwinąć' : ''}`}
              aria-expanded={isActive}
            >
              <div className="link-tile-dock-icon" style={{ '--tile-accent': link.color } as React.CSSProperties}>
                <div className="link-tile-dock-glow" style={{ background: link.color }} />
                <LinkIcon link={link} size="tile" />
                {OPEN_MODE_BADGE[link.openMode] && (
                  <span className="link-open-badge">{OPEN_MODE_BADGE[link.openMode]}</span>
                )}
              </div>
              <span className="link-tile-dock-label">{link.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

import { useEffect } from 'react'
import type { QuickLink } from '../types'
import { EMBED_SIZE_HEIGHT, getEmbedInfo } from '../lib/linkOpenUtils'

interface EmbeddedPanelProps {
  link: QuickLink
  onClose: () => void
  onOpenTab: () => void
}

export function EmbeddedPanel({ link, onClose, onOpenTab }: EmbeddedPanelProps) {
  const embed = getEmbedInfo(link.url)
  const height = EMBED_SIZE_HEIGHT[link.embedSize ?? 'medium']

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="embed-overlay" onClick={onClose}>
      <div
        className={`embed-panel ${link.embedSize === 'fullscreen' ? 'embed-panel-full' : ''}`}
        style={{ '--embed-h': height } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="embed-panel-header">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{link.icon}</span>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{link.label}</p>
              <p className="text-[10px] text-slate-500 truncate">{link.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={onOpenTab} className="embed-btn embed-btn-primary" title="Pełna strona w nowej karcie">
              ↗ Pełna strona
            </button>
            <button type="button" onClick={onClose} className="embed-btn" title="Zamknij">
              ×
            </button>
          </div>
        </header>

        <div className="embed-panel-body">
          {!embed.supportsEmbed || !embed.url ? (
            <div className="embed-fallback">
              <p className="text-4xl mb-3">🚫</p>
              <p className="font-semibold mb-2">Ta strona nie obsługuje podglądu</p>
              <p className="text-sm text-slate-400 mb-4">
                Zmień w panelu admina na <strong>„Nowa karta”</strong> — np. dla YouTube, Facebooka lub POS.
              </p>
              <button type="button" onClick={onOpenTab} className="embed-btn embed-btn-primary px-6">
                Otwórz w nowej karcie
              </button>
            </div>
          ) : (
            <>
              {embed.hint && (
                <p className="text-[10px] text-amber-400/70 px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/15">
                  {embed.hint}
                </p>
              )}
              <iframe
                src={embed.url}
                title={link.label}
                className="embed-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

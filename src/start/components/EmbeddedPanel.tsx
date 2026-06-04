import { useEffect, useState } from 'react'
import type { QuickLink } from '../types'
import { EMBED_SIZE_HEIGHT, getEmbedInfo, resolveYoutubeEmbedUrl } from '../lib/linkOpenUtils'

interface EmbeddedPanelProps {
  link: QuickLink
  onClose: () => void
  onOpenTab: () => void
}

export function EmbeddedPanel({ link, onClose, onOpenTab }: EmbeddedPanelProps) {
  const embed = getEmbedInfo(link.url)
  const height = EMBED_SIZE_HEIGHT[link.embedSize ?? 'medium']
  const [iframeUrl, setIframeUrl] = useState(embed.kind === 'iframe' ? embed.url : '')
  const [videoInput, setVideoInput] = useState('')

  useEffect(() => {
    const next = getEmbedInfo(link.url)
    setIframeUrl(next.kind === 'iframe' ? next.url : '')
    setVideoInput('')
  }, [link.id, link.url])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const loadYoutubeVideo = () => {
    const resolved = resolveYoutubeEmbedUrl(videoInput)
    if (resolved) setIframeUrl(resolved)
  }

  const showIframe = embed.kind === 'iframe' && iframeUrl
  const showYoutubeHome = embed.kind === 'youtube-home' && !iframeUrl

  return (
    <section
      className="embed-inline-wrap"
      aria-label={`Panel: ${link.label}`}
      style={{ '--embed-h': height } as React.CSSProperties}
    >
      <div className="embed-inline-panel">
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
            <button type="button" onClick={onClose} className="embed-btn" title="Zwiń panel">
              ×
            </button>
          </div>
        </header>

        <div className="embed-panel-body">
          {!embed.supportsEmbed ? (
            <EmbedFallback onOpenTab={onOpenTab} message="Ta strona nie obsługuje podglądu w panelu." />
          ) : showYoutubeHome ? (
            <div className="embed-youtube-home">
              <div className="embed-youtube-home-hero">
                <span className="text-4xl">▶️</span>
                <div>
                  <p className="font-bold text-base">YouTube — podgląd filmu</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Strona główna YouTube nie może być osadzona w ramce. Wklej link do filmu lub otwórz pełną stronę.
                  </p>
                </div>
              </div>
              <div className="embed-youtube-input-row">
                <input
                  type="text"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadYoutubeVideo()}
                  placeholder="Link do filmu lub ID (np. dQw4w9WgXcQ)"
                  className="embed-youtube-input"
                />
                <button type="button" onClick={loadYoutubeVideo} className="embed-btn embed-btn-primary shrink-0">
                  Odtwórz
                </button>
              </div>
              {embed.hint && <p className="text-[10px] text-slate-500">{embed.hint}</p>}
              <button type="button" onClick={onOpenTab} className="embed-btn w-full mt-2">
                Otwórz YouTube w nowej karcie
              </button>
            </div>
          ) : showIframe ? (
            <>
              {embed.hint && (
                <p className="text-[10px] text-amber-400/70 px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/15">
                  {embed.hint}
                </p>
              )}
              <iframe
                key={iframeUrl}
                src={iframeUrl}
                title={link.label}
                className="embed-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </>
          ) : (
            <EmbedFallback
              onOpenTab={onOpenTab}
              message="Nie udało się załadować podglądu — strona blokuje osadzanie w ramce."
            />
          )}
        </div>
      </div>
    </section>
  )
}

function EmbedFallback({ message, onOpenTab }: { message: string; onOpenTab: () => void }) {
  return (
    <div className="embed-fallback">
      <p className="text-4xl mb-3">🚫</p>
      <p className="font-semibold mb-2">{message}</p>
      <p className="text-sm text-slate-400 mb-4">
        Zmień w panelu admina na <strong>„Nowa karta”</strong> albo użyj przycisku poniżej.
      </p>
      <button type="button" onClick={onOpenTab} className="embed-btn embed-btn-primary px-6">
        Otwórz w nowej karcie
      </button>
    </div>
  )
}

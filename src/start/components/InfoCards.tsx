import { useState } from 'react'
import type { InfoCard } from '../types'
import { SectionHeader } from './SectionHeader'

interface InfoCardsProps {
  cards: InfoCard[]
}

export function InfoCards({ cards }: InfoCardsProps) {
  const pinned = cards.filter((c) => c.pinned)
  const [copied, setCopied] = useState<string | null>(null)

  if (pinned.length === 0) return null

  const copyContent = async (card: InfoCard) => {
    await navigator.clipboard.writeText(card.content)
    setCopied(card.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section>
      <SectionHeader icon="📋" title="Ważne informacje" badge={`${pinned.length} kart`} />
      <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2 -mx-1 px-1 snap-x">
        {pinned.map((card) => (
          <article
            key={card.id}
            className="panel shrink-0 w-[min(100%,280px)] snap-start p-4 group hover:border-amber-500/25 transition"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{card.icon}</span>
                <h3 className="font-bold text-sm truncate">{card.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => void copyContent(card)}
                className="shrink-0 text-[10px] px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition font-semibold"
              >
                {copied === card.id ? '✓' : '📋'}
              </button>
            </div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed line-clamp-6">
              {card.content}
            </pre>
          </article>
        ))}
      </div>
    </section>
  )
}

import { useState } from 'react'
import type { InfoCard } from '../types'

interface InfoCardsProps {
  cards: InfoCard[]
}

export function InfoCards({ cards }: InfoCardsProps) {
  const pinned = cards.filter((c) => c.pinned)
  const [copied, setCopied] = useState<string | null>(null)

  const copyContent = async (card: InfoCard) => {
    await navigator.clipboard.writeText(card.content)
    setCopied(card.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {pinned.map((card) => (
        <article key={card.id} className="glass rounded-2xl p-5 group hover:bg-white/[0.07] transition">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{card.icon}</span>
              <h3 className="font-bold">{card.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => void copyContent(card)}
              className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              title="Kopiuj treść"
            >
              {copied === card.id ? '✓ Skopiowano' : '📋 Kopiuj'}
            </button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{card.content}</pre>
        </article>
      ))}
    </section>
  )
}

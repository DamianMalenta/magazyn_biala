import type { HandoverNote } from '../types'

interface HandoverBoardProps {
  notes: HandoverNote[]
}

export function HandoverBoard({ notes }: HandoverBoardProps) {
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📌</span> Tablica przekazań między zmianami
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.slice(0, 6).map((note) => (
          <article
            key={note.id}
            className="relative p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 rotate-[-0.5deg] hover:rotate-0 transition-transform"
            style={{ transform: `rotate(${(note.id.charCodeAt(0) % 3) - 1}deg)` }}
          >
            {note.pinned && (
              <span className="absolute -top-2 -right-2 text-lg" title="Przypięte">
                📍
              </span>
            )}
            <p className="text-sm text-amber-100/90 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            <footer className="mt-3 flex items-center justify-between text-[10px] text-amber-400/60 uppercase tracking-wider">
              <span>{note.author}</span>
              <time>{new Date(note.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</time>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}

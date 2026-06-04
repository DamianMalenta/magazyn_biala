import type { Employee, HandoverNote } from '../types'
import { MentionContent } from './MentionContent'

interface HandoverCardProps {
  note: HandoverNote
  employees: Employee[]
  onToggle: () => void
  compact?: boolean
}

export function HandoverCard({ note, employees, onToggle, compact = false }: HandoverCardProps) {
  return (
    <article
      className={`relative flex gap-3 rounded-xl border transition ${
        compact ? 'p-3' : 'p-4'
      } ${
        note.done
          ? 'bg-white/[0.02] border-white/5 opacity-60'
          : 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        title={note.done ? 'Cofnij odhaczenie' : 'Odhacz jako zrobione'}
        className={`shrink-0 w-7 h-7 mt-0.5 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition ${
          note.done
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
            : 'border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/20 text-transparent hover:text-amber-400'
        }`}
      >
        {note.done ? '✓' : ''}
      </button>

      <div className="flex-1 min-w-0">
        {note.pinned && !note.done && (
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-300 mb-1">
            📍 Ważne
          </span>
        )}
        <MentionContent
          content={note.content}
          mentions={note.mentions ?? []}
          employees={employees}
          done={note.done}
        />
        <footer className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 uppercase tracking-wider">
          <span>{note.author}</span>
          <time>{new Date(note.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</time>
          {note.done && note.doneBy && (
            <span className="text-emerald-500/70 normal-case">
              ✓ {note.doneBy}
              {note.doneAt &&
                ` · ${new Date(note.doneAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}`}
            </span>
          )}
        </footer>
      </div>
    </article>
  )
}

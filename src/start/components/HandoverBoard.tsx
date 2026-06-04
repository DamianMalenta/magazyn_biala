import { useState } from 'react'
import { uid } from '../lib/storage'
import { loadHandoverAuthor, saveHandoverAuthor, sortHandoverNotes } from '../lib/handoverUtils'
import { parseMentions } from '../lib/mentionUtils'
import type { Employee, HandoverNote } from '../types'
import { MentionContent } from './MentionContent'
import { MentionTextarea } from './MentionTextarea'
import { SectionHeader } from './SectionHeader'

interface HandoverBoardProps {
  notes: HandoverNote[]
  employees: Employee[]
  onUpdate: (notes: HandoverNote[]) => void
}

export function HandoverBoard({ notes, employees, onUpdate }: HandoverBoardProps) {
  const [draft, setDraft] = useState('')
  const [author, setAuthor] = useState(loadHandoverAuthor)
  const [showDone, setShowDone] = useState(false)

  const sorted = sortHandoverNotes(notes)
  const active = sorted.filter((n) => !n.done)
  const completed = sorted.filter((n) => n.done)

  const handleAuthorChange = (name: string) => {
    setAuthor(name)
    saveHandoverAuthor(name)
  }

  const addNote = () => {
    if (!draft.trim()) return
    const content = draft.trim()
    const mentions = parseMentions(content, employees)
    const newNote: HandoverNote = {
      id: uid(),
      author: author.trim() || 'Zespół',
      content,
      mentions,
      createdAt: new Date().toISOString(),
      pinned: false,
      done: false,
    }
    onUpdate([newNote, ...notes])
    setDraft('')
  }

  const toggleDone = (id: string) => {
    onUpdate(
      notes.map((n) => {
        if (n.id !== id) return n
        if (n.done) {
          return { ...n, done: false, doneAt: undefined, doneBy: undefined }
        }
        return {
          ...n,
          done: true,
          doneAt: new Date().toISOString(),
          doneBy: author.trim() || 'Zespół',
        }
      }),
    )
  }

  return (
    <section className="panel panel-accent p-5 md:p-6 flex flex-col gap-4 h-full">
      <SectionHeader
        icon="📌"
        title="Przekazania między zmianami"
        badge={active.length > 0 ? `${active.length} otwartych` : undefined}
        badgeVariant="amber"
      />

      {/* Lista zadań — najpierw */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-3">
        {active.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-6 italic">Brak otwartych przekazań — wszystko ogarnięte! 🎉</p>
        ) : (
          active.map((note) => (
            <HandoverCard key={note.id} note={note} employees={employees} onToggle={() => toggleDone(note.id)} />
          ))
        )}

        {completed.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowDone((v) => !v)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition w-full"
            >
              <span>{showDone ? '▼' : '▶'}</span>
              <span>Zrobione ({completed.length})</span>
            </button>
            {showDone && (
              <div className="space-y-2 mt-3">
                {completed.map((note) => (
                  <HandoverCard key={note.id} note={note} employees={employees} onToggle={() => toggleDone(note.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nowe przekazanie — na dole */}
      <div className="shrink-0 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 border-t-2 border-t-amber-500/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Nowe przekazanie</p>
        <input
          value={author}
          onChange={(e) => handleAuthorChange(e.target.value)}
          placeholder="Twoje imię (zapamiętane w tej przeglądarce)"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-amber-500 text-sm"
        />
        <MentionTextarea
          value={draft}
          onChange={setDraft}
          onSubmit={addNote}
          employees={employees}
          placeholder="Np. @Kasia sprawdź zamrażarkę, brakuje pomidorów…"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={!draft.trim()}
          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 font-semibold text-sm transition"
        >
          + Dodaj przekazanie
        </button>
      </div>
    </section>
  )
}

function HandoverCard({
  note,
  employees,
  onToggle,
}: {
  note: HandoverNote
  employees: Employee[]
  onToggle: () => void
}) {
  return (
    <article
      className={`relative flex gap-3 p-4 rounded-xl border transition ${
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
              {note.doneAt && ` · ${new Date(note.doneAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}`}
            </span>
          )}
        </footer>
      </div>
    </article>
  )
}

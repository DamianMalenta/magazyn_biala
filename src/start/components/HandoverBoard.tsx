import { useState } from 'react'
import { uid } from '../lib/storage'
import { loadHandoverAuthor, saveHandoverAuthor, sortHandoverNotes } from '../lib/handoverUtils'
import type { HandoverNote } from '../types'

interface HandoverBoardProps {
  notes: HandoverNote[]
  onUpdate: (notes: HandoverNote[]) => void
}

export function HandoverBoard({ notes, onUpdate }: HandoverBoardProps) {
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
    const newNote: HandoverNote = {
      id: uid(),
      author: author.trim() || 'Zespół',
      content: draft.trim(),
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
    <section className="glass rounded-3xl p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>📌</span> Tablica przekazań między zmianami
        {active.length > 0 && (
          <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
            {active.length} do zrobienia
          </span>
        )}
      </h2>

      {/* Formularz dla pracowników */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
        <input
          value={author}
          onChange={(e) => handleAuthorChange(e.target.value)}
          placeholder="Twoje imię (zapamiętane w tej przeglądarce)"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-amber-500 text-sm"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote()
          }}
          placeholder="Np. brakuje pomidorów, rezerwacja VIP o 19:00, POS się zawiesił…"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-amber-500 text-sm min-h-[72px] resize-y"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={!draft.trim()}
          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 font-semibold text-sm transition"
        >
          + Dodaj przekazanie dla następnej zmiany
        </button>
        <p className="text-[10px] text-amber-400/50 text-center">Ctrl+Enter — szybkie wysłanie</p>
      </div>

      {/* Aktywne przekazania */}
      {active.length === 0 ? (
        <p className="text-center text-slate-500 text-sm py-4 italic">Brak otwartych przekazań — wszystko ogarnięte! 🎉</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {active.map((note) => (
            <HandoverCard key={note.id} note={note} onToggle={() => toggleDone(note.id)} />
          ))}
        </div>
      )}

      {/* Odhaczone / zrobione */}
      {completed.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition w-full"
          >
            <span>{showDone ? '▼' : '▶'}</span>
            <span>Zrobione ({completed.length})</span>
          </button>
          {showDone && (
            <div className="grid grid-cols-1 gap-2 mt-3">
              {completed.map((note) => (
                <HandoverCard key={note.id} note={note} onToggle={() => toggleDone(note.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function HandoverCard({ note, onToggle }: { note: HandoverNote; onToggle: () => void }) {
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
        <p
          className={`text-sm whitespace-pre-wrap leading-relaxed ${
            note.done ? 'line-through text-slate-500' : 'text-amber-100/90'
          }`}
        >
          {note.content}
        </p>
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

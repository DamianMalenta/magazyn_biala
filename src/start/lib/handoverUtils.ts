import type { HandoverNote } from '../types'

const AUTHOR_KEY = 'startpage-handover-author'

export function normalizeHandoverNote(note: HandoverNote): HandoverNote {
  return {
    ...note,
    done: note.done ?? false,
    pinned: note.pinned ?? false,
    mentions: note.mentions ?? [],
  }
}

export function loadHandoverAuthor(): string {
  return localStorage.getItem(AUTHOR_KEY) ?? ''
}

export function saveHandoverAuthor(name: string): void {
  localStorage.setItem(AUTHOR_KEY, name.trim())
}

export function sortHandoverNotes(notes: HandoverNote[]): HandoverNote[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.done !== b.done) return a.done ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

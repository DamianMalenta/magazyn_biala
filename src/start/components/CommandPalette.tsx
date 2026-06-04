import { useEffect, useMemo, useRef, useState } from 'react'
import type { InfoCard, QuickLink } from '../types'
import { LinkIcon } from './LinkIcon'

interface CommandItem {
  id: string
  label: string
  sublabel?: string
  icon: string
  link?: QuickLink
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  links: QuickLink[]
  infoCards: InfoCard[]
  onOpenAdmin: () => void
}

export function CommandPalette({ open, onClose, links, infoCards, onOpenAdmin }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      ...links.map((l) => ({
        id: `link-${l.id}`,
        label: l.label,
        sublabel: l.url,
        icon: l.icon,
        link: l,
        action: () => window.open(l.url, '_blank'),
      })),
      ...infoCards.map((c) => ({
        id: `info-${c.id}`,
        label: c.title,
        sublabel: c.content.slice(0, 60),
        icon: c.icon,
        action: () => void navigator.clipboard.writeText(c.content),
      })),
      {
        id: 'admin',
        label: 'Panel administratora',
        sublabel: 'Zarządzaj stroną startową',
        icon: '⚙️',
        action: onOpenAdmin,
      },
    ]

    if (!query.trim()) return list
    const q = query.toLowerCase()
    return list.filter(
      (i) => i.label.toLowerCase().includes(q) || i.sublabel?.toLowerCase().includes(q),
    )
  }, [links, infoCards, query, onOpenAdmin])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, items.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && items[selected]) {
        e.preventDefault()
        items[selected].action()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, items, selected, onClose])

  if (!open) return null

  return (
    <div className="command-overlay" onClick={onClose}>
      <div
        className="w-full max-w-xl glass-strong rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-slate-500">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj stron, instrukcji, akcji…"
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-600"
          />
          <kbd className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-500">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto scrollbar-thin py-2">
          {items.length === 0 ? (
            <li className="px-4 py-8 text-center text-slate-500">Brak wyników</li>
          ) : (
            items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    item.action()
                    onClose()
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                    i === selected ? 'bg-violet-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  {item.link ? (
                    <LinkIcon link={item.link} size="command" />
                  ) : (
                    <span className="text-xl w-6 text-center">{item.icon}</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {item.sublabel && (
                      <p className="text-xs text-slate-500 truncate">{item.sublabel}</p>
                    )}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="px-4 py-2 border-t border-white/10 text-[10px] text-slate-600 flex gap-4">
          <span>↑↓ nawigacja</span>
          <span>↵ wybierz</span>
          <span>Ctrl+K otwórz</span>
        </div>
      </div>
    </div>
  )
}

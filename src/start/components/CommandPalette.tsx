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
  onOpenLink: (link: QuickLink) => void
}

export function CommandPalette(props: CommandPaletteProps) {
  if (!props.open) return null
  return <CommandPaletteDialog {...props} />
}

function CommandPaletteDialog({
  onClose,
  links,
  infoCards,
  onOpenAdmin,
  onOpenLink,
}: CommandPaletteProps) {
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
        action: () => onOpenLink(l),
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
  }, [links, infoCards, query, onOpenAdmin, onOpenLink])

  const activeIndex = items.length === 0 ? 0 : Math.min(selected, items.length - 1)

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
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
      if (e.key === 'Enter' && items[activeIndex]) {
        e.preventDefault()
        items[activeIndex].action()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [items, activeIndex, onClose])

  return (
    <div className="command-overlay" onClick={onClose}>
      <div
        className="w-full max-w-xl panel-strong rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-amber-500/70">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
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
                    i === activeIndex ? 'bg-amber-500/15' : 'hover:bg-white/5'
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
      </div>
    </div>
  )
}

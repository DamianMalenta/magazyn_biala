interface SearchBarProps {
  searchEngine: 'google' | 'duckduckgo'
  embedded?: boolean
  compact?: boolean
}

export function SearchBar({ searchEngine, embedded = false, compact = false }: SearchBarProps) {
  const action = searchEngine === 'google' ? 'https://www.google.com/search' : 'https://duckduckgo.com/'

  return (
    <form
      action={action}
      method="GET"
      target="_blank"
      className={
        embedded
          ? `flex items-center gap-2 w-full bg-black/25 border border-white/10 focus-within:border-amber-500/40 transition ${
              compact ? 'px-3 py-1.5 rounded-xl' : 'px-4 py-2.5 rounded-2xl gap-3'
            }`
          : 'panel flex items-center gap-3 px-5 py-3'
      }
    >
      <span className="text-slate-500 text-lg shrink-0">{searchEngine === 'google' ? '🔍' : '🦆'}</span>
      <input
        name="q"
        type="search"
        placeholder="Szukaj w internecie…"
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-600 min-w-0"
        autoComplete="off"
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold transition shrink-0"
      >
        Szukaj
      </button>
    </form>
  )
}

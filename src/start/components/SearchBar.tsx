interface SearchBarProps {
  searchEngine: 'google' | 'duckduckgo'
}

export function SearchBar({ searchEngine }: SearchBarProps) {
  const action = searchEngine === 'google' ? 'https://www.google.com/search' : 'https://duckduckgo.com/'

  return (
    <form action={action} method="GET" target="_blank" className="glass rounded-2xl flex items-center gap-3 px-5 py-3">
      <span className="text-slate-500 text-lg">{searchEngine === 'google' ? '🔍' : '🦆'}</span>
      <input
        name="q"
        type="search"
        placeholder="Szukaj w Google…"
        className="flex-1 bg-transparent outline-none text-base placeholder:text-slate-600"
        autoComplete="off"
      />
      <button
        type="submit"
        className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition"
      >
        Szukaj
      </button>
    </form>
  )
}

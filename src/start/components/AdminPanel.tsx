import { useState } from 'react'
import { uid } from '../lib/storage'
import { DAY_KEYS, DAY_LABELS, type DayKey, type StartPageConfig } from '../types'

type AdminTab = 'ustawienia' | 'linki' | 'info' | 'grafik' | 'przekazania' | 'backup'

interface AdminPanelProps {
  config: StartPageConfig
  onUpdate: (config: StartPageConfig) => void
  onClose: () => void
  onLogout: () => void
  onExport: () => void
  onImport: (file: File) => Promise<{ ok: boolean; error?: string }>
  onReset: () => void
}

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'ustawienia', label: 'Ustawienia', icon: '⚙️' },
  { id: 'linki', label: 'Skróty', icon: '🔗' },
  { id: 'info', label: 'Instrukcje', icon: '📋' },
  { id: 'grafik', label: 'Grafik', icon: '📅' },
  { id: 'przekazania', label: 'Przekazania', icon: '📌' },
  { id: 'backup', label: 'Backup', icon: '💾' },
]

export function AdminPanel({
  config,
  onUpdate,
  onClose,
  onLogout,
  onExport,
  onImport,
  onReset,
}: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('ustawienia')

  const patch = (partial: Partial<StartPageConfig>) => onUpdate({ ...config, ...partial })

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="admin-drawer">
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold">Panel administratora</h2>
            <p className="text-xs text-slate-500">Zarządzaj stroną startową Chrome</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
              Wyloguj
            </button>
            <button type="button" onClick={onClose} className="text-xl px-2 hover:text-violet-400">
              ×
            </button>
          </div>
        </header>

        <nav className="shrink-0 flex gap-1 px-4 py-3 overflow-x-auto scrollbar-thin border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                tab === t.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {tab === 'ustawienia' && <SettingsTab config={config} patch={patch} />}
          {tab === 'linki' && <LinksTab config={config} patch={patch} />}
          {tab === 'info' && <InfoTab config={config} patch={patch} />}
          {tab === 'grafik' && <ScheduleTab config={config} patch={patch} />}
          {tab === 'przekazania' && <HandoverTab config={config} patch={patch} />}
          {tab === 'backup' && (
            <BackupTab onExport={onExport} onImport={onImport} onReset={onReset} />
          )}
        </div>
      </aside>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-violet-500 text-sm'

function SettingsTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  return (
    <div>
      <Field label="Nazwa firmy / restauracji">
        <input
          className={inputCls}
          value={config.companyName}
          onChange={(e) => patch({ companyName: e.target.value })}
        />
      </Field>
      <Field label="Podtytuł">
        <input className={inputCls} value={config.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
      </Field>
      <Field label="PIN administratora">
        <input
          className={inputCls}
          value={config.adminPin}
          onChange={(e) => patch({ adminPin: e.target.value })}
          type="password"
        />
      </Field>
      <Field label="Wyszukiwarka">
        <select
          className={inputCls}
          value={config.searchEngine}
          onChange={(e) => patch({ searchEngine: e.target.value as 'google' | 'duckduckgo' })}
        >
          <option value="google">Google</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </Field>
    </div>
  )
}

function LinksTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  const updateLink = (id: string, field: string, value: string | boolean) => {
    patch({
      quickLinks: config.quickLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    })
  }

  const addLink = () => {
    patch({
      quickLinks: [
        ...config.quickLinks,
        { id: uid(), label: 'Nowy skrót', url: 'https://', icon: '⭐', color: '#8b5cf6', pinned: true },
      ],
    })
  }

  const removeLink = (id: string) => {
    if (!window.confirm('Usunąć ten skrót?')) return
    patch({ quickLinks: config.quickLinks.filter((l) => l.id !== id) })
  }

  return (
    <div className="space-y-4">
      {config.quickLinks.map((link) => (
        <div key={link.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex gap-2">
            <input className={`${inputCls} w-16 text-center text-xl`} value={link.icon} onChange={(e) => updateLink(link.id, 'icon', e.target.value)} />
            <input className={`${inputCls} flex-1`} value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} placeholder="Nazwa" />
            <input className={`${inputCls} w-24`} type="color" value={link.color} onChange={(e) => updateLink(link.id, 'color', e.target.value)} title="Kolor" />
          </div>
          <input className={inputCls} value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} placeholder="URL" />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={link.pinned} onChange={(e) => updateLink(link.id, 'pinned', e.target.checked)} />
              Pokaż na stronie
            </label>
            <button type="button" onClick={() => removeLink(link.id)} className="text-xs text-red-400 hover:text-red-300">
              Usuń
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addLink} className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-violet-500 text-sm text-slate-400 hover:text-white transition">
        + Dodaj skrót
      </button>
    </div>
  )
}

function InfoTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  const updateCard = (id: string, field: string, value: string | boolean) => {
    patch({
      infoCards: config.infoCards.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  const addCard = () => {
    patch({
      infoCards: [
        ...config.infoCards,
        { id: uid(), title: 'Nowa instrukcja', content: 'Treść…', icon: '📝', pinned: true },
      ],
    })
  }

  const removeCard = (id: string) => {
    if (!window.confirm('Usunąć tę kartę?')) return
    patch({ infoCards: config.infoCards.filter((c) => c.id !== id) })
  }

  return (
    <div className="space-y-4">
      {config.infoCards.map((card) => (
        <div key={card.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex gap-2">
            <input className={`${inputCls} w-16 text-center text-xl`} value={card.icon} onChange={(e) => updateCard(card.id, 'icon', e.target.value)} />
            <input className={`${inputCls} flex-1`} value={card.title} onChange={(e) => updateCard(card.id, 'title', e.target.value)} />
          </div>
          <textarea
            className={`${inputCls} min-h-[100px] resize-y`}
            value={card.content}
            onChange={(e) => updateCard(card.id, 'content', e.target.value)}
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={card.pinned} onChange={(e) => updateCard(card.id, 'pinned', e.target.checked)} />
              Pokaż na stronie
            </label>
            <button type="button" onClick={() => removeCard(card.id)} className="text-xs text-red-400 hover:text-red-300">
              Usuń
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addCard} className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-violet-500 text-sm text-slate-400 hover:text-white transition">
        + Dodaj instrukcję
      </button>
    </div>
  )
}

function ScheduleTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  const updateEmployee = (id: string, field: string, value: string) => {
    patch({
      employees: config.employees.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    })
  }

  const addEmployee = () => {
    patch({
      employees: [...config.employees, { id: uid(), name: 'Nowy', color: '#8b5cf6', role: 'Zespół' }],
    })
  }

  const removeEmployee = (id: string) => {
    if (!window.confirm('Usunąć pracownika z grafiku?')) return
    const schedule = { ...config.schedule }
    for (const day of DAY_KEYS) {
      schedule[day] = schedule[day].filter((s) => s.employeeId !== id)
    }
    patch({
      employees: config.employees.filter((e) => e.id !== id),
      schedule,
    })
  }

  const setShift = (day: DayKey, employeeId: string, value: string) => {
    const schedule = { ...config.schedule }
    const others = schedule[day].filter((s) => s.employeeId !== employeeId)

    if (!value.trim() || value.trim() === '-') {
      schedule[day] = others
    } else {
      const match = value.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s*(.*))?$/)
      if (match) {
        const [, start, end, note] = match
        const pad = (t: string) => {
          const [h, m] = t.split(':')
          return `${h.padStart(2, '0')}:${m}`
        }
        schedule[day] = [...others, { employeeId, start: pad(start), end: pad(end), note: note?.trim() }]
      }
    }
    patch({ schedule })
  }

  const getShiftText = (day: DayKey, employeeId: string): string => {
    const shift = config.schedule[day]?.find((s) => s.employeeId === employeeId)
    if (!shift) return ''
    return `${shift.start}–${shift.end}${shift.note ? ` ${shift.note}` : ''}`
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">
        Wpisz godziny w formacie <code className="text-violet-400">08:00-16:00</code> lub zostaw puste dla wolnego.
        Możesz dodać notatkę: <code className="text-violet-400">10:00-18:00 sala</code>
      </p>

      <div className="space-y-3 mb-6">
        {config.employees.map((emp) => (
          <div key={emp.id} className="flex gap-2 items-center p-3 rounded-xl bg-white/5">
            <input className={`${inputCls} w-16`} type="color" value={emp.color} onChange={(e) => updateEmployee(emp.id, 'color', e.target.value)} />
            <input className={`${inputCls} flex-1`} value={emp.name} onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)} placeholder="Imię" />
            <input className={`${inputCls} flex-1`} value={emp.role} onChange={(e) => updateEmployee(emp.id, 'role', e.target.value)} placeholder="Rola" />
            <button type="button" onClick={() => removeEmployee(emp.id)} className="text-red-400 px-2">×</button>
          </div>
        ))}
        <button type="button" onClick={addEmployee} className="text-sm text-violet-400 hover:text-violet-300">+ Dodaj pracownika</button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 uppercase">
              <th className="p-2 text-left">Osoba</th>
              {DAY_KEYS.map((d) => (
                <th key={d} className="p-2">{DAY_LABELS[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.employees.map((emp) => (
              <tr key={emp.id}>
                <td className="p-2 font-medium whitespace-nowrap">{emp.name}</td>
                {DAY_KEYS.map((day) => (
                  <td key={day} className="p-1">
                    <input
                      className="w-full px-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-violet-500 text-center font-mono text-[10px]"
                      value={getShiftText(day, emp.id)}
                      onChange={(e) => setShift(day, emp.id, e.target.value)}
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HandoverTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  const [draft, setDraft] = useState('')
  const [author, setAuthor] = useState('')

  const addNote = () => {
    if (!draft.trim()) return
    patch({
      handoverNotes: [
        {
          id: uid(),
          author: author.trim() || 'Anonim',
          content: draft.trim(),
          createdAt: new Date().toISOString(),
          pinned: false,
        },
        ...config.handoverNotes,
      ],
    })
    setDraft('')
  }

  const togglePin = (id: string) => {
    patch({
      handoverNotes: config.handoverNotes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n,
      ),
    })
  }

  const removeNote = (id: string) => {
    patch({ handoverNotes: config.handoverNotes.filter((n) => n.id !== id) })
  }

  return (
    <div>
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 space-y-2">
        <input className={inputCls} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Twoje imię (opcjonalnie)" />
        <textarea
          className={`${inputCls} min-h-[80px]`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Wpisz przekazanie dla następnej zmiany…"
        />
        <button type="button" onClick={addNote} className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-semibold text-sm transition">
          Opublikuj przekazanie
        </button>
      </div>

      <div className="space-y-2">
        {config.handoverNotes.map((note) => (
          <div key={note.id} className="p-3 rounded-xl bg-white/5 flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <p className="text-[10px] text-slate-500 mt-1">{note.author} · {new Date(note.createdAt).toLocaleString('pl-PL')}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button type="button" onClick={() => togglePin(note.id)} className="text-sm" title="Przypnij">
                {note.pinned ? '📍' : '📌'}
              </button>
              <button type="button" onClick={() => removeNote(note.id)} className="text-sm text-red-400">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BackupTab({
  onExport,
  onImport,
  onReset,
}: {
  onExport: () => void
  onImport: (file: File) => Promise<{ ok: boolean; error?: string }>
  onReset: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/5">
        <h3 className="font-bold mb-2">Eksport / Import</h3>
        <p className="text-sm text-slate-400 mb-4">
          Zapisz konfigurację jako JSON i wczytaj na innym komputerze — idealne do synchronizacji między stanowiskami.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onExport} className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold">
            Eksportuj JSON
          </button>
          <label className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold text-center cursor-pointer">
            Importuj JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  void onImport(file).then((r) => {
                    if (!r.ok) alert(r.error)
                    else alert('Zaimportowano pomyślnie!')
                  })
                }
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
        <h3 className="font-bold text-red-400 mb-2">Reset do domyślnych</h3>
        <p className="text-sm text-slate-400 mb-4">Przywraca przykładową konfigurację. Tej operacji nie można cofnąć.</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Na pewno przywrócić domyślną konfigurację?')) onReset()
          }}
          className="w-full py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-sm font-semibold"
        >
          Resetuj wszystko
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <h3 className="font-bold text-emerald-400 mb-2">Chrome — jak ustawić?</h3>
        <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
          <li>Zainstaluj rozszerzenie <strong>Custom New Tab URL</strong> lub <strong>New Tab Redirect</strong></li>
          <li>Ustaw URL na adres tej strony (np. GitHub Pages lub lokalny <code className="text-emerald-300">start.html</code>)</li>
          <li>Alternatywnie: Chrome → Ustawienia → Przy starcie → Otwórz konkretną stronę</li>
        </ol>
      </div>
    </div>
  )
}

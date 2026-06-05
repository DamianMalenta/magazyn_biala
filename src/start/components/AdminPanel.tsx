import { useEffect, useState } from 'react'
import { uid } from '../lib/storage'
import { moveItem } from '../lib/arrayUtils'
import type { StartPageConfig } from '../types'
import { LinksEditor } from './admin/LinksEditor'
import { WorkspaceEditor } from './admin/WorkspaceEditor'
import { MentionTextarea } from './MentionTextarea'
import { extractMentions } from '../lib/mentionUtils'
import { ScheduleEditor } from './admin/ScheduleEditor'
import {
  TabHeader,
  Field,
  inputCls,
  btnPrimary,
  btnGhost,
  btnDanger,
  Toggle,
  Toast,
  ICON_PRESETS,
} from './admin/AdminUi'

type AdminTab = 'ustawienia' | 'stanowisko' | 'wyglad' | 'linki' | 'info' | 'grafik' | 'przekazania' | 'backup'

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
  { id: 'ustawienia', label: 'Ogólne', icon: '⚙️' },
  { id: 'stanowisko', label: 'Stanowisko', icon: '🖥️' },
  { id: 'wyglad', label: 'Sekcje', icon: '👁️' },
  { id: 'linki', label: 'Kafelki', icon: '🔗' },
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
  const [tab, setTab] = useState<AdminTab>('linki')
  const [toast, setToast] = useState<string | null>(null)

  const patch = (partial: Partial<StartPageConfig>) => onUpdate({ ...config, ...partial })

  const notify = (msg: string) => {
    setToast(msg)
  }

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(id)
  }, [toast])

  const stats = {
    links: config.quickLinks.filter((l) => l.pinned).length,
    info: config.infoCards.filter((c) => c.pinned).length,
    team: config.employees.length,
    notes: config.handoverNotes.length,
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="admin-drawer">
        <header className="shrink-0 px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">Centrum zarządzania</p>
              <h2 className="text-xl font-black tracking-tight">Panel administratora</h2>
              <p className="text-xs text-slate-500 mt-1">
                {stats.links} kafelków · {stats.team} osób · {stats.info} instrukcji
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={onLogout} className={btnGhost}>
                Wyloguj
              </button>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-xl leading-none">
                ×
              </button>
            </div>
          </div>
        </header>

        <nav className="shrink-0 flex gap-1 px-4 py-3 overflow-x-auto scrollbar-thin border-b border-white/10 bg-slate-950/50">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                tab === t.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {tab === 'ustawienia' && <SettingsTab config={config} patch={patch} />}
          {tab === 'stanowisko' && <WorkspaceEditor config={config} patch={patch} onToast={notify} />}
          {tab === 'wyglad' && <SectionsTab config={config} patch={patch} />}
          {tab === 'linki' && <LinksEditor config={config} patch={patch} onToast={notify} />}
          {tab === 'info' && <InfoTab config={config} patch={patch} onToast={notify} />}
          {tab === 'grafik' && <ScheduleEditor config={config} patch={patch} onToast={notify} />}
          {tab === 'przekazania' && <HandoverTab config={config} patch={patch} onToast={notify} />}
          {tab === 'backup' && (
            <BackupTab onExport={onExport} onImport={onImport} onReset={onReset} onToast={notify} />
          )}
        </div>

        <footer className="shrink-0 px-6 py-3 border-t border-white/10 bg-emerald-950/30 text-xs text-emerald-400/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Zmiany zapisują się automatycznie w tej przeglądarce
        </footer>
      </aside>

      <Toast message={toast} />
    </>
  )
}

function SettingsTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  const [showPin, setShowPin] = useState(false)

  return (
    <div>
      <TabHeader
        title="Ustawienia ogólne"
        description="Nazwa widoczna na stronie startowej, bezpieczeństwo panelu admina i domyślna wyszukiwarka."
      />
      <Field label="Nazwa firmy / restauracji">
        <input className={inputCls} value={config.companyName} onChange={(e) => patch({ companyName: e.target.value })} />
      </Field>
      <Field label="Podtytuł (stopka strony)">
        <input className={inputCls} value={config.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
      </Field>
      <Field label="PIN administratora" hint="Używany do wejścia w ten panel. Domyślnie: 2024">
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={config.adminPin}
            onChange={(e) => patch({ adminPin: e.target.value })}
            type={showPin ? 'text' : 'password'}
          />
          <button type="button" onClick={() => setShowPin((v) => !v)} className={`${btnGhost} shrink-0`}>
            {showPin ? 'Ukryj' : 'Pokaż'}
          </button>
        </div>
      </Field>
      <Field label="Wyszukiwarka na stronie startowej">
        <select
          className={inputCls}
          value={config.searchEngine}
          onChange={(e) => patch({ searchEngine: e.target.value as 'google' | 'duckduckgo' })}
        >
          <option value="google">Google</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </Field>
      <Field label="Miasto (pogoda)" hint="Open-Meteo — np. Białystok, Warszawa">
        <input
          className={inputCls}
          value={config.weather.city}
          onChange={(e) =>
            patch({
              weather: { ...config.weather, city: e.target.value, latitude: null, longitude: null },
            })
          }
          placeholder="Białystok"
        />
      </Field>
    </div>
  )
}

function SectionsTab({
  config,
  patch,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
}) {
  const update = (key: keyof StartPageConfig['sections'], value: boolean) => {
    patch({ sections: { ...config.sections, [key]: value } })
  }

  const items: { key: keyof StartPageConfig['sections']; label: string; desc: string }[] = [
    { key: 'showShiftPulse', label: 'Shift Pulse (zegar + kto na zmianie)', desc: 'Nagłówek z live statusem zespołu' },
    { key: 'showSearch', label: 'Pasek wyszukiwania', desc: 'Google / DuckDuckGo' },
    { key: 'showQuickLinks', label: 'Duże kafelki skrótów', desc: 'POS, mail, Facebook itd.' },
    { key: 'showSchedule', label: 'Grafik tygodniowy', desc: 'Siatka pracownik × dni' },
    { key: 'showHandover', label: 'Tablica przekazań', desc: 'Notatki między zmianami' },
    { key: 'showInfoCards', label: 'Karty instrukcji', desc: 'Wi-Fi, alarm, kontakty' },
    { key: 'showWeather', label: 'Widget pogody', desc: 'Pogoda i prognoza na 7 dni / godziny (Open-Meteo)' },
  ]

  return (
    <div>
      <TabHeader
        title="Widoczne sekcje strony"
        description="Włączaj i wyłączaj całe bloki na stronie startowej — bez usuwania danych. Przydatne, gdy chcesz uprościć widok."
      />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={config.sections[item.key]} onChange={(v) => update(item.key, v)} label="" />
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoTab({
  config,
  patch,
  onToast,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
  onToast: (msg: string) => void
}) {
  const updateCard = (id: string, field: string, value: string | boolean) => {
    patch({
      infoCards: config.infoCards.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  const addCard = () => {
    patch({
      infoCards: [...config.infoCards, { id: uid(), title: 'Nowa instrukcja', content: 'Treść…', icon: '📝', pinned: true }],
    })
    onToast('Dodano instrukcję')
  }

  const removeCard = (id: string, title: string) => {
    if (!window.confirm(`Usunąć „${title}"?`)) return
    patch({ infoCards: config.infoCards.filter((c) => c.id !== id) })
    onToast('Instrukcja usunięta')
  }

  const moveCard = (index: number, dir: -1 | 1) => {
    patch({ infoCards: moveItem(config.infoCards, index, dir) })
  }

  return (
    <div>
      <TabHeader
        title="Instrukcje i ważne informacje"
        description="Karty z treścią widoczną na dole strony — hasła Wi-Fi, procedury, numery kontaktowe. Pracownicy mogą kopiować treść jednym kliknięciem."
      />

      <div className="flex justify-end mb-4">
        <button type="button" onClick={addCard} className={btnPrimary}>
          + Dodaj instrukcję
        </button>
      </div>

      <div className="space-y-4">
        {config.infoCards.map((card, index) => (
          <article key={card.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex gap-2">
              <input className={`${inputCls} w-14 text-center text-xl`} value={card.icon} onChange={(e) => updateCard(card.id, 'icon', e.target.value)} />
              <input className={`${inputCls} flex-1`} value={card.title} onChange={(e) => updateCard(card.id, 'title', e.target.value)} placeholder="Tytuł" />
            </div>
            <textarea className={`${inputCls} min-h-[100px] resize-y`} value={card.content} onChange={(e) => updateCard(card.id, 'content', e.target.value)} />
            <div className="flex flex-wrap gap-1">
              {ICON_PRESETS.map((icon) => (
                <button key={icon} type="button" onClick={() => updateCard(card.id, 'icon', icon)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-base">
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Toggle checked={card.pinned} onChange={(v) => updateCard(card.id, 'pinned', v)} label="Pokaż na stronie" />
              <div className="flex gap-1">
                <button type="button" disabled={index === 0} onClick={() => moveCard(index, -1)} className={btnGhost}>↑</button>
                <button type="button" disabled={index === config.infoCards.length - 1} onClick={() => moveCard(index, 1)} className={btnGhost}>↓</button>
                <button type="button" onClick={() => removeCard(card.id, card.title)} className={btnDanger}>Usuń</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function HandoverTab({
  config,
  patch,
  onToast,
}: {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
  onToast: (msg: string) => void
}) {
  const [draft, setDraft] = useState('')
  const [author, setAuthor] = useState('')

  const addNote = () => {
    if (!draft.trim()) return
    const content = draft.trim()
    patch({
      handoverNotes: [
        {
          id: uid(),
          author: author.trim() || 'Anonim',
          content,
          mentions: extractMentions(content, config.employees),
          createdAt: new Date().toISOString(),
          pinned: false,
          done: false,
        },
        ...config.handoverNotes,
      ],
    })
    setDraft('')
    onToast('Opublikowano przekazanie')
  }


  const toggleDone = (id: string) => {
    patch({
      handoverNotes: config.handoverNotes.map((n) => {
        if (n.id !== id) return n
        if (n.done) return { ...n, done: false, doneAt: undefined, doneBy: undefined }
        return { ...n, done: true, doneAt: new Date().toISOString(), doneBy: 'Admin' }
      }),
    })
  }

  const updateNote = (id: string, content: string) => {
    patch({
      handoverNotes: config.handoverNotes.map((n) =>
        n.id === id ? { ...n, content, mentions: extractMentions(content, config.employees) } : n,
      ),
    })
  }

  const togglePin = (id: string) => {
    patch({ handoverNotes: config.handoverNotes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })
  }

  const removeNote = (id: string) => {
    if (!window.confirm('Usunąć to przekazanie?')) return
    patch({ handoverNotes: config.handoverNotes.filter((n) => n.id !== id) })
    onToast('Usunięto przekazanie')
  }

  return (
    <div>
      <TabHeader
        title="Przekazania między zmianami"
        description="Publikuj i edytuj notatki dla następnej zmiany. Przypięte wiadomości są zawsze widoczne na górze tablicy."
      />

      <div className="space-y-3 mb-6">
        {config.handoverNotes.map((note) => (
          <article key={note.id} className={`p-4 rounded-2xl border border-white/10 ${note.done ? 'bg-white/[0.02] opacity-60' : 'bg-white/5'}`}>
            <textarea
              className={`${inputCls} min-h-[72px] mb-2`}
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-slate-500">{note.author} · {new Date(note.createdAt).toLocaleString('pl-PL')}</p>
              <div className="flex gap-1 flex-wrap">
                <button type="button" onClick={() => toggleDone(note.id)} className={btnGhost}>
                  {note.done ? '↩ Cofnij' : '✓ Odhacz'}
                </button>
                <button type="button" onClick={() => togglePin(note.id)} className={btnGhost} title="Przypnij">
                  {note.pinned ? '📍 Przypięte' : '📌 Przypnij'}
                </button>
                <button type="button" onClick={() => removeNote(note.id)} className={btnDanger}>Usuń</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Nowe przekazanie</p>
        <input className={inputCls} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Twoje imię (opcjonalnie)" />
        <MentionTextarea
          value={draft}
          onChange={setDraft}
          onSubmit={addNote}
          employees={config.employees}
          placeholder="Np. @Kasia sprawdź zamrażarkę…"
        />
        <button type="button" onClick={addNote} className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-semibold text-sm transition">
          Opublikuj przekazanie
        </button>
      </div>
    </div>
  )
}

function BackupTab({
  onExport,
  onImport,
  onReset,
  onToast,
}: {
  onExport: () => void
  onImport: (file: File) => Promise<{ ok: boolean; error?: string }>
  onReset: () => void
  onToast: (msg: string) => void
}) {
  return (
    <div>
      <TabHeader
        title="Backup i synchronizacja"
        description="Eksportuj całą konfigurację (kafelki, grafik, instrukcje) i wczytaj na innym komputerze. Reset przywraca ustawienia przykładowe."
      />

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-bold mb-2">Eksport / Import JSON</h3>
          <p className="text-sm text-slate-400 mb-4">Jeden plik zawiera wszystko — idealny do kopiowania między stanowiskami POS.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { onExport(); onToast('Pobrano plik backup') }} className={btnPrimary}>
              Eksportuj JSON
            </button>
            <label className={`${btnGhost} cursor-pointer`}>
              Importuj JSON
              <input type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onImport(file).then((r) => { if (!r.ok) alert(r.error); else onToast('Zaimportowano konfigurację') })
                e.target.value = ''
              }} />
            </label>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
          <h3 className="font-bold text-red-400 mb-2">Reset do domyślnych</h3>
          <p className="text-sm text-slate-400 mb-4">Usuwa Twoją konfigurację i przywraca przykładowe dane.</p>
          <button type="button" onClick={() => { if (window.confirm('Na pewno przywrócić domyślną konfigurację?')) onReset() }} className="w-full py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-sm font-semibold">
            Resetuj wszystko
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <h3 className="font-bold text-emerald-400 mb-2">Chrome / Windows — strona startowa</h3>
          <p className="text-sm text-slate-400 mb-3">
            Pełna konfiguracja stanowiska (pełny ekran, autostart Windows, skróty) jest w zakładce <strong>Stanowisko</strong>.
          </p>
          <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Zainstaluj rozszerzenie <strong>Custom New Tab URL</strong></li>
            <li>Ustaw URL: <code className="text-emerald-300">…/start.html</code></li>
            <li>Lub: Chrome → Ustawienia → Przy starcie → konkretna strona</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

import { uid } from '../../lib/storage'
import { moveItem } from '../../lib/arrayUtils'
import type { QuickLink, StartPageConfig } from '../../types'
import {
  TabHeader,
  Field,
  inputCls,
  btnPrimary,
  btnGhost,
  btnDanger,
  Toggle,
  TilePreview,
  ICON_PRESETS,
} from './AdminUi'

interface LinksEditorProps {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
  onToast: (msg: string) => void
}

export function LinksEditor({ config, patch, onToast }: LinksEditorProps) {
  const visibleCount = config.quickLinks.filter((l) => l.pinned).length

  const updateLink = (id: string, field: keyof QuickLink, value: string | boolean) => {
    patch({
      quickLinks: config.quickLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    })
  }

  const addLink = () => {
    patch({
      quickLinks: [
        ...config.quickLinks,
        { id: uid(), label: 'Nowy kafelek', url: 'https://', icon: '⭐', color: '#8b5cf6', pinned: true },
      ],
    })
    onToast('Dodano nowy kafelek')
  }

  const removeLink = (id: string, label: string) => {
    if (!window.confirm(`Usunąć kafelek „${label}"? Tej operacji nie można cofnąć.`)) return
    patch({ quickLinks: config.quickLinks.filter((l) => l.id !== id) })
    onToast('Kafelek usunięty')
  }

  const duplicateLink = (link: QuickLink) => {
    patch({
      quickLinks: [
        ...config.quickLinks,
        { ...link, id: uid(), label: `${link.label} (kopia)` },
      ],
    })
    onToast('Skopiowano kafelek')
  }

  const moveLink = (index: number, dir: -1 | 1) => {
    patch({ quickLinks: moveItem(config.quickLinks, index, dir) })
  }

  return (
    <div>
      <TabHeader
        title="Duże kafelki skrótów"
        description="Dodawaj, usuwaj i układaj kafelki widoczne na stronie startowej. Kolejność na liście = kolejność na ekranie. Wyłącz „Pokaż na stronie”, aby ukryć kafelek bez usuwania."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
        <div>
          <p className="text-sm font-semibold text-violet-200">
            {visibleCount} widocznych · {config.quickLinks.length} łącznie
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Zmiany zapisują się automatycznie</p>
        </div>
        <button type="button" onClick={addLink} className={btnPrimary}>
          + Dodaj kafelek
        </button>
      </div>

      <div className="space-y-4">
        {config.quickLinks.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/15 text-slate-500">
            <p className="text-4xl mb-3">🔗</p>
            <p className="mb-4">Brak kafelków — dodaj pierwszy skrót</p>
            <button type="button" onClick={addLink} className={btnPrimary}>
              + Dodaj kafelek
            </button>
          </div>
        ) : (
          config.quickLinks.map((link, index) => (
            <article
              key={link.id}
              className={`rounded-2xl border overflow-hidden transition ${
                link.pinned ? 'border-white/10 bg-white/[0.04]' : 'border-slate-700/50 bg-slate-900/40 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <TilePreview link={link} />

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <input
                      className={`${inputCls} w-14 text-center text-xl shrink-0`}
                      value={link.icon}
                      onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                      title="Ikona (emoji)"
                      maxLength={4}
                    />
                    <input
                      className={`${inputCls} flex-1 min-w-[120px]`}
                      value={link.label}
                      onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                      placeholder="Nazwa kafelka"
                    />
                    <input
                      className={`${inputCls} w-12 shrink-0 cursor-pointer`}
                      type="color"
                      value={link.color}
                      onChange={(e) => updateLink(link.id, 'color', e.target.value)}
                      title="Kolor podświetlenia"
                    />
                  </div>

                  <Field label="Adres URL" hint="Pełny link, np. https://smartlunch.pl">
                    <input
                      className={inputCls}
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </Field>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Szybki wybór ikony
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ICON_PRESETS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => updateLink(link.id, 'icon', icon)}
                          className={`w-9 h-9 rounded-lg text-lg hover:bg-white/10 transition ${
                            link.icon === icon ? 'bg-violet-600/30 ring-1 ring-violet-500' : 'bg-white/5'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <Toggle
                      checked={link.pinned}
                      onChange={(v) => updateLink(link.id, 'pinned', v)}
                      label="Pokaż na stronie startowej"
                    />

                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveLink(index, -1)}
                        className={btnGhost}
                        title="Przesuń w lewo / wyżej"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === config.quickLinks.length - 1}
                        onClick={() => moveLink(index, 1)}
                        className={btnGhost}
                        title="Przesuń w prawo / niżej"
                      >
                        ↓
                      </button>
                      <button type="button" onClick={() => duplicateLink(link)} className={btnGhost}>
                        Duplikuj
                      </button>
                      <button type="button" onClick={() => removeLink(link.id, link.label)} className={btnDanger}>
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {config.quickLinks.length > 0 && (
        <button
          type="button"
          onClick={addLink}
          className="w-full mt-4 py-3 rounded-xl border border-dashed border-violet-500/40 text-violet-300 hover:bg-violet-500/10 text-sm font-semibold transition"
        >
          + Dodaj kolejny kafelek
        </button>
      )}
    </div>
  )
}

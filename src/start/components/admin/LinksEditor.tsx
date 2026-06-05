import { uid } from '../../lib/storage'
import { moveItem } from '../../lib/arrayUtils'
import { extractHostname } from '../../lib/faviconUtils'
import {
  OPEN_MODE_DESCRIPTIONS,
  OPEN_MODE_LABELS,
  getEmbedInfo,
} from '../../lib/linkOpenUtils'
import { isInternalModuleUrl, resolveQuickLinkUrl } from '../../lib/internalLinks'
import { isMusicLink } from '../../lib/musicUtils'
import type { EmbedSize, LinkOpenMode, QuickLinkType } from '../../types'
import type { IconMode, QuickLink, StartPageConfig } from '../../types'
import { LinkIcon } from '../LinkIcon'
import {
  TabHeader,
  Field,
  inputCls,
  btnPrimary,
  btnGhost,
  btnDanger,
  Toggle,
  ICON_PRESETS,
} from './AdminUi'

interface LinksEditorProps {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
  onToast: (msg: string) => void
}

export function LinksEditor({ config, patch, onToast }: LinksEditorProps) {
  const visibleCount = config.quickLinks.filter((l) => l.pinned).length

  const updateLink = <K extends keyof QuickLink>(id: string, field: K, value: QuickLink[K]) => {
    patch({
      quickLinks: config.quickLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    })
  }

  const setIconMode = (id: string, mode: IconMode) => {
    updateLink(id, 'iconMode', mode)
    onToast(mode === 'auto' ? 'Ikona pobierana ze strony' : 'Ikona ręczna (emoji)')
  }

  const addLink = () => {
    patch({
      quickLinks: [
        ...config.quickLinks,
        {
          id: uid(),
          label: 'Nowy kafelek',
          url: 'https://',
          icon: '🔗',
          iconMode: 'auto',
          openMode: config.workspace.defaultLinkOpenMode,
          embedSize: 'medium',
          color: '#8b5cf6',
          pinned: true,
        },
      ],
    })
    onToast('Dodano nowy kafelek')
  }

  const addMusicLink = () => {
    patch({
      quickLinks: [
        ...config.quickLinks,
        {
          id: uid(),
          label: 'Muzyka',
          url: 'music://player',
          linkType: 'music',
          icon: '🎵',
          iconMode: 'manual',
          openMode: 'embed',
          embedSize: 'medium',
          color: '#a855f7',
          pinned: true,
        },
      ],
    })
    onToast('Dodano odtwarzacz muzyki (panel audio)')
  }

  const removeLink = (id: string, label: string) => {
    if (!window.confirm(`Usunąć kafelek „${label}"? Tej operacji nie można cofnąć.`)) return
    patch({ quickLinks: config.quickLinks.filter((l) => l.id !== id) })
    onToast('Kafelek usunięty')
  }

  const duplicateLink = (link: QuickLink) => {
    patch({
      quickLinks: [...config.quickLinks, { ...link, id: uid(), label: `${link.label} (kopia)` }],
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
        description="Ikony domyślnie pobierają favicon ze strony (URL). Możesz przełączyć na ręczne emoji. Kolejność na liście = kolejność na ekranie."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
        <div>
          <p className="text-sm font-semibold text-violet-200">
            {visibleCount} widocznych · {config.quickLinks.length} łącznie
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Zmiany zapisują się automatycznie</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addLink} className={btnPrimary}>
            + Dodaj kafelek
          </button>
          <button type="button" onClick={addMusicLink} className={btnGhost}>
            + Odtwarzacz muzyki
          </button>
        </div>
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
            <LinkCard
              key={link.id}
              link={link}
              defaultOpenMode={config.workspace.defaultLinkOpenMode}
              index={index}
              total={config.quickLinks.length}
              onUpdate={updateLink}
              onSetIconMode={setIconMode}
              onMove={moveLink}
              onDuplicate={() => duplicateLink(link)}
              onRemove={() => removeLink(link.id, link.label)}
            />
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

function LinkCard({
  link,
  defaultOpenMode,
  index,
  total,
  onUpdate,
  onSetIconMode,
  onMove,
  onDuplicate,
  onRemove,
}: {
  link: QuickLink
  defaultOpenMode: LinkOpenMode
  index: number
  total: number
  onUpdate: <K extends keyof QuickLink>(id: string, field: K, value: QuickLink[K]) => void
  onSetIconMode: (id: string, mode: IconMode) => void
  onMove: (index: number, dir: -1 | 1) => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const isMusic = isMusicLink(link.url, link.linkType)
  const hostname = extractHostname(link.url)
  const isAuto = link.iconMode === 'auto' && !isMusic

  return (
    <article
      className={`rounded-2xl border overflow-hidden transition ${
        link.pinned ? 'border-white/10 bg-white/[0.04]' : 'border-slate-700/50 bg-slate-900/40 opacity-80'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div
          className="w-32 h-32 relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 shrink-0 mx-auto sm:mx-0"
        >
          <div className="absolute inset-0 rounded-2xl opacity-30 blur-xl" style={{ background: link.color }} />
          <LinkIcon link={link} size="preview" />
          <span className="relative text-[10px] font-bold uppercase tracking-wide text-center px-1 truncate w-full">
            {link.label}
          </span>
          {!link.pinned && (
            <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              ukryty
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              className={`${inputCls} flex-1 min-w-[120px]`}
              value={link.label}
              onChange={(e) => onUpdate(link.id, 'label', e.target.value)}
              placeholder="Nazwa kafelka"
            />
            <input
              className={`${inputCls} w-12 shrink-0 cursor-pointer`}
              type="color"
              value={link.color}
              onChange={(e) => onUpdate(link.id, 'color', e.target.value)}
              title="Kolor podświetlenia"
            />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Typ kafelka
            </span>
            <div className="flex flex-wrap gap-2 mb-3">
              {(
                [
                  ['link', '🔗 Zwykły link'],
                  ['music', '🎵 Muzyka w panelu'],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onUpdate(link.id, 'linkType', type as QuickLinkType)
                    if (type === 'music') {
                      onUpdate(link.id, 'url', 'music://player')
                      onUpdate(link.id, 'openMode', 'embed')
                      onUpdate(link.id, 'iconMode', 'manual')
                      if (!link.icon || link.icon === '🔗') onUpdate(link.id, 'icon', '🎵')
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    (isMusic ? 'music' : 'link') === type
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Field
            label={isMusic ? 'Adres (opcjonalny)' : 'Adres URL'}
            hint={
              isMusic
                ? 'Odtwarzacz audio w panelu — bez YouTube i bez filmów'
                : 'Favicon pobierany automatycznie z tej domeny'
            }
          >
            <input
              className={inputCls}
              value={link.url}
              onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
              placeholder={isMusic ? 'music://player' : 'https://smartlunch.pl'}
              disabled={isMusic}
            />
            {isMusic && (
              <p className="text-[10px] text-emerald-400/80 mt-1.5">
                Ustaw „Panel pod kafelkami” — stacje lounge, jazz, chill i własny strumień MP3.
              </p>
            )}
            {isAuto && hostname && (
              <p className="text-[10px] text-emerald-400/80 mt-1.5">Źródło ikony: {hostname}</p>
            )}
          </Field>


          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Sposób otwierania
            </span>
            <div className="flex flex-wrap gap-2 mb-2">
              {(['shell', 'tab', 'embed', 'window'] as LinkOpenMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdate(link.id, 'openMode', mode)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    (link.openMode ?? defaultOpenMode) === mode
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {OPEN_MODE_LABELS[mode]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              {OPEN_MODE_DESCRIPTIONS[link.openMode ?? defaultOpenMode]}
            </p>
            {!isMusic && (link.openMode ?? defaultOpenMode) === 'shell' && link.url.length > 8 && (
              <p
                className={`text-[10px] mb-2 ${isInternalModuleUrl(resolveQuickLinkUrl(link.url)) ? 'text-emerald-400/90' : 'text-amber-400/90'}`}
              >
                {isInternalModuleUrl(resolveQuickLinkUrl(link.url))
                  ? '✓ Moduł własny — otworzy się wewnątrz (iframe) pod paskiem'
                  : '↗ Link zewnętrzny — otworzy osobne okno pod paskiem (Facebook, banki itd.)'}
              </p>
            )}
            {(link.openMode ?? defaultOpenMode) === 'embed' && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-slate-500">Wysokość panelu:</span>
                {(['compact', 'medium', 'large', 'fullscreen'] as EmbedSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdate(link.id, 'embedSize', sz)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${
                      (link.embedSize ?? 'medium') === sz ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {sz === 'compact' ? 'Mały' : sz === 'medium' ? 'Średni' : sz === 'large' ? 'Duży' : 'Pełny'}
                  </button>
                ))}
                {!isMusic &&
                  !getEmbedInfo(link.url).supportsEmbed &&
                  link.url.length > 12 && (
                  <span className="text-[10px] text-amber-400">⚠ Strona może blokować podgląd</span>
                )}
                {isMusic && (
                  <span className="text-[10px] text-emerald-400">✓ Odtwarzacz audio — bez iframe</span>
                )}
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Źródło ikony
            </span>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => onSetIconMode(link.id, 'auto')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isAuto ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                🌐 Ze strony (auto)
              </button>
              <button
                type="button"
                onClick={() => onSetIconMode(link.id, 'manual')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  !isAuto ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                ✏️ Ręcznie (emoji)
              </button>
            </div>

            {isAuto ? (
              <p className="text-xs text-slate-500">
                Emoji poniżej = zapas gdy strona nie ma favicon.{' '}
                <input
                  className="inline-block w-12 text-center bg-white/5 border border-white/10 rounded-lg mx-1"
                  value={link.icon}
                  onChange={(e) => onUpdate(link.id, 'icon', e.target.value)}
                  maxLength={4}
                  title="Emoji zapasowe"
                />
              </p>
            ) : (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    className={`${inputCls} w-14 text-center text-xl shrink-0`}
                    value={link.icon}
                    onChange={(e) => onUpdate(link.id, 'icon', e.target.value)}
                    maxLength={4}
                  />
                  <button type="button" onClick={() => onSetIconMode(link.id, 'auto')} className={btnGhost}>
                    Wróć do auto ze strony
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ICON_PRESETS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => onUpdate(link.id, 'icon', icon)}
                      className={`w-9 h-9 rounded-lg text-lg hover:bg-white/10 transition ${
                        link.icon === icon ? 'bg-violet-600/30 ring-1 ring-violet-500' : 'bg-white/5'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            <Toggle
              checked={link.pinned}
              onChange={(v) => onUpdate(link.id, 'pinned', v)}
              label="Pokaż na stronie startowej"
            />
            <div className="flex flex-wrap gap-1">
              <button type="button" disabled={index === 0} onClick={() => onMove(index, -1)} className={btnGhost}>
                ↑
              </button>
              <button type="button" disabled={index === total - 1} onClick={() => onMove(index, 1)} className={btnGhost}>
                ↓
              </button>
              <button type="button" onClick={onDuplicate} className={btnGhost}>
                Duplikuj
              </button>
              <button type="button" onClick={onRemove} className={btnDanger}>
                Usuń
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

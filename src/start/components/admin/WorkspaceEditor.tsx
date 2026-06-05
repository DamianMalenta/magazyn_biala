import { uid } from '../../lib/storage'
import { moveItem } from '../../lib/arrayUtils'
import {
  downloadChromeAppBat,
  downloadChromeKioskBat,
  downloadChromeStartupInstructions,
  downloadWindowsStartupBat,
  resolvePanelUrl,
} from '../../lib/windowsDeploy'
import type { StartPageConfig, WindowsShortcut, WindowsShortcutTargetType } from '../../types'
import { OPEN_MODE_LABELS } from '../../lib/linkOpenUtils'
import type { LinkOpenMode } from '../../types'
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

interface WorkspaceEditorProps {
  config: StartPageConfig
  patch: (p: Partial<StartPageConfig>) => void
  onToast: (msg: string) => void
}

export function WorkspaceEditor({ config, patch, onToast }: WorkspaceEditorProps) {
  const ws = config.workspace
  const panelUrl = resolvePanelUrl(ws.panelUrl)

  const patchWorkspace = (partial: Partial<StartPageConfig['workspace']>) => {
    patch({ workspace: { ...ws, ...partial } })
  }

  const updateShortcut = (id: string, field: keyof WindowsShortcut, value: string | boolean) => {
    patchWorkspace({
      windowsShortcuts: ws.windowsShortcuts.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    })
  }

  const addShortcut = () => {
    patchWorkspace({
      windowsShortcuts: [
        ...ws.windowsShortcuts,
        {
          id: uid(),
          label: 'Nowy skrót',
          icon: '🖥️',
          target: '',
          targetType: 'info',
          enabled: true,
        },
      ],
    })
    onToast('Dodano skrót Windows')
  }

  const removeShortcut = (id: string) => {
    patchWorkspace({ windowsShortcuts: ws.windowsShortcuts.filter((s) => s.id !== id) })
    onToast('Usunięto skrót')
  }

  const moveShortcut = (index: number, dir: -1 | 1) => {
    patchWorkspace({ windowsShortcuts: moveItem(ws.windowsShortcuts, index, dir) })
  }

  return (
    <div className="space-y-8">
      <section>
        <TabHeader
          title="Tryb stanowiska pracy"
          description="Wymuś pełny ekran w przeglądarce i ustaw domyślny sposób otwierania kafelków. Pracownicy widzą te ustawienia od razu po starcie."
        />

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">Wymuś pełny ekran przy starcie</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Panel wchodzi w tryb F11 automatycznie — idealne dla stanowisk POS i kuchni.
              </p>
            </div>
            <Toggle
              checked={ws.forceFullscreen}
              onChange={(v) => patchWorkspace({ forceFullscreen: v })}
              label=""
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">Zablokuj wyjście z pełnego ekranu</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Po naciśnięciu Esc/F11 panel wraca do pełnego ekranu (wymaga włączonego wymuszania).
              </p>
            </div>
            <Toggle
              checked={ws.lockFullscreen}
              onChange={(v) => patchWorkspace({ lockFullscreen: v })}
              label=""
            />
          </div>

          <Field label="Domyślny sposób otwierania nowych kafelków">
            <div className="flex flex-wrap gap-2">
              {(['shell', 'tab', 'embed', 'window'] as LinkOpenMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => patchWorkspace({ defaultLinkOpenMode: mode })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    ws.defaultLinkOpenMode === mode
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {OPEN_MODE_LABELS[mode]}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </section>

      <section>
        <TabHeader
          title="Windows — autostart przy uruchomieniu"
          description="Pobierz gotowe skrypty .bat i ustaw panel jako pierwszą aplikację po włączeniu komputera. Adres panelu jest generowany automatycznie."
        />

        <Field label="Adres panelu (URL)" hint="Zostaw puste — użyje bieżącego adresu strony">
          <input
            className={inputCls}
            value={ws.panelUrl}
            onChange={(e) => patchWorkspace({ panelUrl: e.target.value })}
            placeholder={panelUrl}
          />
          <p className="text-[10px] text-emerald-400/80 mt-1.5">Aktywny URL: {panelUrl}</p>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <button
            type="button"
            onClick={() => { downloadChromeAppBat(panelUrl); onToast('Pobrano uruchom-panel.bat') }}
            className={`${btnPrimary} text-left`}
          >
            <span className="block font-bold">📱 Chrome — tryb aplikacji</span>
            <span className="block text-xs opacity-80 mt-1">Bez paska adresu, pełny ekran</span>
          </button>
          <button
            type="button"
            onClick={() => { downloadChromeKioskBat(panelUrl); onToast('Pobrano uruchom-panel-kiosk.bat') }}
            className={`${btnGhost} text-left border border-amber-500/30`}
          >
            <span className="block font-bold">🔒 Chrome — kiosk</span>
            <span className="block text-xs opacity-80 mt-1">Maksymalna blokada — stanowisko POS</span>
          </button>
          <button
            type="button"
            onClick={() => { downloadWindowsStartupBat(panelUrl); onToast('Pobrano instaluj-autostart-windows.bat') }}
            className={`${btnPrimary} text-left sm:col-span-2`}
          >
            <span className="block font-bold">🚀 Instaluj autostart Windows</span>
            <span className="block text-xs opacity-80 mt-1">Skrót w folderze Startup — uruchamia się przy logowaniu</span>
          </button>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Alternatywa — Chrome bez skryptów</p>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {downloadChromeStartupInstructions(panelUrl)}
          </pre>
        </div>
      </section>

      <section>
        <TabHeader
          title="Skróty Windows dla pracowników"
          description="Widoczne na pasku powłoki przy otwartych stronach. Typ „Protokół” próbuje uruchomić aplikację Windows (np. kalkulator). Typ „Info” pokazuje instrukcję."
        />

        <div className="flex justify-end mb-4">
          <button type="button" onClick={addShortcut} className={btnPrimary}>+ Dodaj skrót</button>
        </div>

        <div className="space-y-3">
          {ws.windowsShortcuts.map((shortcut, index) => (
            <article key={shortcut.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex gap-2">
                <input
                  className={`${inputCls} w-14 text-center text-xl`}
                  value={shortcut.icon}
                  onChange={(e) => updateShortcut(shortcut.id, 'icon', e.target.value)}
                />
                <input
                  className={`${inputCls} flex-1`}
                  value={shortcut.label}
                  onChange={(e) => updateShortcut(shortcut.id, 'label', e.target.value)}
                  placeholder="Nazwa"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {ICON_PRESETS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateShortcut(shortcut.id, 'icon', icon)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-base"
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <Field label="Typ skrótu">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['web', '🌐 Strona web'],
                      ['protocol', '⚡ Protokół Windows'],
                      ['info', '📋 Instrukcja'],
                    ] as const
                  ).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateShortcut(shortcut.id, 'targetType', type as WindowsShortcutTargetType)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                        shortcut.targetType === type ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <input
                className={inputCls}
                value={shortcut.target}
                onChange={(e) => updateShortcut(shortcut.id, 'target', e.target.value)}
                placeholder={
                  shortcut.targetType === 'web'
                    ? 'https://…'
                    : shortcut.targetType === 'protocol'
                      ? 'calculator: lub ms-settings:'
                      : 'Tekst instrukcji dla pracownika'
                }
              />
              <input
                className={inputCls}
                value={shortcut.description ?? ''}
                onChange={(e) => updateShortcut(shortcut.id, 'description', e.target.value)}
                placeholder="Opis (tooltip)"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Toggle
                  checked={shortcut.enabled}
                  onChange={(v) => updateShortcut(shortcut.id, 'enabled', v)}
                  label="Widoczny na pasku"
                />
                <div className="flex gap-1">
                  <button type="button" disabled={index === 0} onClick={() => moveShortcut(index, -1)} className={btnGhost}>↑</button>
                  <button type="button" disabled={index === ws.windowsShortcuts.length - 1} onClick={() => moveShortcut(index, 1)} className={btnGhost}>↓</button>
                  <button type="button" onClick={() => removeShortcut(shortcut.id)} className={btnDanger}>Usuń</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

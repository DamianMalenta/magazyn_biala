import { useEffect, useState } from 'react'
import { useStartPageConfig } from './hooks/useStartPageConfig'
import { useClock } from './hooks/useClock'
import { useAdminAuth } from './hooks/useAdminAuth'
import { isFirstVisit } from './lib/storage'
import { HeroHeader } from './components/HeroHeader'
import { QuickLinksGrid } from './components/QuickLinksGrid'
import { WeeklyScheduleView } from './components/WeeklyScheduleView'
import { InfoCards } from './components/InfoCards'
import { HandoverBoard } from './components/HandoverBoard'
import { SearchBar } from './components/SearchBar'
import { CommandPalette } from './components/CommandPalette'
import { AdminLogin } from './components/AdminLogin'
import { AdminPanel } from './components/AdminPanel'
import { useLinkOpener } from './hooks/useLinkOpener'
import { EmbeddedPanel } from './components/EmbeddedPanel'
import { MusicPanel } from './components/MusicPanel'
import { isMusicLink } from './lib/musicUtils'
import { WeatherWidget } from './components/WeatherWidget'
import { useWeather } from './hooks/useWeather'

export default function StartApp() {
  const { config, update, reset, resetAdminPin, exportBackup, importBackup } = useStartPageConfig()
  const { time, date } = useClock()
  const { isAdmin, showLogin, setShowLogin, login, logout } = useAdminAuth()
  const [commandOpen, setCommandOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [firstVisit] = useState(() => isFirstVisit())
  const { openLink, embeddedLink, closeEmbed, openEmbeddedInTab } = useLinkOpener()
  const { sections } = config

  const openHandoverCount = config.handoverNotes.filter((n) => !n.done).length
  const weatherState = useWeather(config.weather, sections.showWeather)

  useEffect(() => {
    if (firstVisit) setShowLogin(true)
  }, [firstVisit, setShowLogin])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const openAdmin = () => {
    if (isAdmin) setAdminOpen(true)
    else setShowLogin(true)
  }

  const handleLogin = (pin: string) => {
    const ok = login(pin)
    if (ok) setAdminOpen(true)
    return ok
  }

  return (
    <>
      <div className="mesh-bg" />

      {firstVisit && !isAdmin && !showLogin && (
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-4">
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="w-full p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-sm font-semibold hover:bg-amber-500/20 transition text-center"
          >
            🎉 Pierwsza konfiguracja — kliknij tutaj (PIN: 2024)
          </button>
        </div>
      )}

      <div className="relative min-h-screen max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8 flex flex-col gap-5 md:gap-6">
        {sections.showShiftPulse && (
          <HeroHeader
            employees={config.employees}
            schedule={config.schedule}
            companyName={config.companyName}
            time={time}
            date={date}
            showSearch={sections.showSearch}
            showWeather={sections.showWeather}
            weather={weatherState}
            searchEngine={config.searchEngine}
            openHandoverCount={openHandoverCount}
          />
        )}

        {!sections.showShiftPulse && sections.showSearch && (
          <div className="panel p-4">
            <SearchBar searchEngine={config.searchEngine} />
          </div>
        )}
        {!sections.showShiftPulse && sections.showWeather && (
          <div className="panel p-4 flex justify-end">
            <WeatherWidget data={weatherState.data} loading={weatherState.loading} error={weatherState.error} />
          </div>
        )}

        {sections.showQuickLinks && (
          <>
            <QuickLinksGrid
              links={config.quickLinks}
              activeEmbedId={embeddedLink?.id}
              onOpenLink={openLink}
            />
            {embeddedLink && (embeddedLink.openMode ?? 'tab') === 'embed' && (
              isMusicLink(embeddedLink.url, embeddedLink.linkType) ? (
                <MusicPanel link={embeddedLink} onClose={closeEmbed} />
              ) : (
                <EmbeddedPanel link={embeddedLink} onClose={closeEmbed} onOpenTab={openEmbeddedInTab} />
              )
            )}
          </>
        )}

        {(sections.showSchedule || sections.showHandover) && (
          <div
            className={`grid grid-cols-1 gap-5 md:gap-6 ${
              sections.showSchedule && sections.showHandover ? 'xl:grid-cols-5' : ''
            }`}
          >
            {sections.showSchedule && (
              <div className={sections.showHandover ? 'xl:col-span-3' : ''}>
                <WeeklyScheduleView schedule={config.schedule} employees={config.employees} />
              </div>
            )}
            {sections.showHandover && (
              <div className={sections.showSchedule ? 'xl:col-span-2' : ''}>
                <HandoverBoard
                  notes={config.handoverNotes}
                  employees={config.employees}
                  onUpdate={(handoverNotes) => update({ ...config, handoverNotes })}
                />
              </div>
            )}
          </div>
        )}

        {sections.showInfoCards && <InfoCards cards={config.infoCards} />}

        <footer className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-[11px] text-slate-600">
          <p>{config.tagline}</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setCommandOpen(true)} className="hover:text-amber-400/80 transition flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] font-mono text-[10px]">Ctrl+K</kbd>
              Szukaj
            </button>
            <button type="button" onClick={openAdmin} className="hover:text-amber-400/80 transition">
              ⚙️ Admin
            </button>
          </div>
        </footer>
      </div>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        links={config.quickLinks}
        infoCards={config.infoCards}
        onOpenAdmin={() => { setCommandOpen(false); openAdmin() }}
        onOpenLink={openLink}
      />

      {showLogin && !isAdmin && (
        <AdminLogin
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          isFirstVisit={firstVisit}
          onResetPin={resetAdminPin}
          onFullReset={reset}
        />
      )}

      {adminOpen && isAdmin && (
        <AdminPanel
          config={config}
          onUpdate={update}
          onClose={() => setAdminOpen(false)}
          onLogout={() => { logout(); setAdminOpen(false) }}
          onExport={exportBackup}
          onImport={async (file) => {
            const r = await importBackup(file)
            return r.ok ? { ok: true } : { ok: false, error: r.error }
          }}
          onReset={() => { reset(); setAdminOpen(false) }}
        />
      )}
    </>
  )
}

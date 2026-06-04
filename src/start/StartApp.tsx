import { useEffect, useState } from 'react'
import { useStartPageConfig } from './hooks/useStartPageConfig'
import { useClock } from './hooks/useClock'
import { useAdminAuth } from './hooks/useAdminAuth'
import { isFirstVisit } from './lib/storage'
import { QuickLinksGrid } from './components/QuickLinksGrid'
import { ShiftPulse } from './components/ShiftPulse'
import { WeeklyScheduleView } from './components/WeeklyScheduleView'
import { InfoCards } from './components/InfoCards'
import { HandoverBoard } from './components/HandoverBoard'
import { SearchBar } from './components/SearchBar'
import { CommandPalette } from './components/CommandPalette'
import { AdminLogin } from './components/AdminLogin'
import { AdminPanel } from './components/AdminPanel'

export default function StartApp() {
  const { config, update, reset, resetAdminPin, exportBackup, importBackup } = useStartPageConfig()
  const { time, date } = useClock()
  const { isAdmin, showLogin, setShowLogin, login, logout } = useAdminAuth()
  const [commandOpen, setCommandOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [firstVisit] = useState(() => isFirstVisit())
  const { sections } = config

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

  const handleResetPin = () => {
    resetAdminPin()
  }

  const handleFullReset = () => {
    reset()
  }

  return (
    <>
      <div className="mesh-bg" />

      {firstVisit && !isAdmin && !showLogin && (
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="w-full p-4 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-200 text-sm font-semibold hover:bg-violet-600/30 transition text-center"
          >
            🎉 Pierwsza konfiguracja — kliknij tutaj, aby ustawić stronę startową (PIN: 2024)
          </button>
        </div>
      )}

      <div className="relative min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col gap-6">
        {sections.showShiftPulse && (
          <ShiftPulse
            employees={config.employees}
            schedule={config.schedule}
            companyName={config.companyName}
            time={time}
            date={date}
          />
        )}

        {sections.showSearch && <SearchBar searchEngine={config.searchEngine} />}

        {sections.showQuickLinks && <QuickLinksGrid links={config.quickLinks} />}

        {(sections.showSchedule || sections.showHandover) && (
          <div className={`grid grid-cols-1 gap-6 ${sections.showSchedule && sections.showHandover ? 'xl:grid-cols-2' : ''}`}>
            {sections.showSchedule && (
              <WeeklyScheduleView schedule={config.schedule} employees={config.employees} />
            )}
            {sections.showHandover && <HandoverBoard notes={config.handoverNotes} />}
          </div>
        )}

        {sections.showInfoCards && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 px-1">
              <span>📋</span> Ważne informacje i instrukcje
            </h2>
            <InfoCards cards={config.infoCards} />
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-slate-600">
          <p>{config.tagline}</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setCommandOpen(true)} className="hover:text-violet-400 transition flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">Ctrl+K</kbd> Szybkie wyszukiwanie
            </button>
            <button type="button" onClick={openAdmin} className="hover:text-violet-400 transition flex items-center gap-1">
              ⚙️ Panel admina
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
      />

      {showLogin && !isAdmin && (
        <AdminLogin
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          isFirstVisit={firstVisit}
          onResetPin={handleResetPin}
          onFullReset={handleFullReset}
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

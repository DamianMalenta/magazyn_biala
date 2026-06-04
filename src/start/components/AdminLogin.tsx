import { useState } from 'react'
import { DEFAULT_ADMIN_PIN } from '../lib/storage'

interface AdminLoginProps {
  onLogin: (pin: string) => boolean
  onClose: () => void
  isFirstVisit: boolean
  onResetPin: () => void
  onFullReset: () => void
}

export function AdminLogin({ onLogin, onClose, isFirstVisit, onResetPin, onFullReset }: AdminLoginProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = pin.trim()
    if (onLogin(trimmed)) return
    setError(true)
  }

  const tryDefaultPin = () => {
    setPin(DEFAULT_ADMIN_PIN)
    if (onLogin(DEFAULT_ADMIN_PIN)) return
    setError(true)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-strong rounded-3xl p-8 w-full max-w-md text-center"
      >
        <div className="text-4xl mb-4">{isFirstVisit ? '🎉' : '🔐'}</div>
        <h2 className="text-xl font-bold mb-2">
          {isFirstVisit ? 'Pierwsza konfiguracja' : 'Panel administratora'}
        </h2>

        {isFirstVisit ? (
          <div className="mb-6 p-4 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-left text-sm space-y-2">
            <p className="text-violet-200 font-semibold">Witaj! To Twoje pierwsze uruchomienie.</p>
            <p className="text-slate-300">
              Użyj domyślnego PIN-u: <strong className="text-white font-mono text-lg">{DEFAULT_ADMIN_PIN}</strong>
            </p>
            <p className="text-slate-400 text-xs">
              Po zalogowaniu ustaw własny PIN w zakładce <strong>Ogólne</strong> i skonfiguruj kafelki, grafik oraz instrukcje.
            </p>
            <button
              type="button"
              onClick={tryDefaultPin}
              className="w-full mt-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-sm transition"
            >
              Wejdź z PIN {DEFAULT_ADMIN_PIN} i rozpocznij konfigurację
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-6">Wpisz PIN administratora strony startowej</p>
        )}

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError(false)
          }}
          placeholder="Wpisz PIN"
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-2xl tracking-[0.5em] font-mono outline-none ${
            error ? 'border-red-500' : 'border-white/10 focus:border-violet-500'
          }`}
          autoFocus={!isFirstVisit}
        />
        {error && (
          <p className="text-red-400 text-sm mt-2">
            Nieprawidłowy PIN. Jeśli to pierwsze logowanie, użyj <strong>{DEFAULT_ADMIN_PIN}</strong>.
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold transition"
        >
          Wejdź do panelu
        </button>

        <div className="mt-5 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowRecovery((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            {showRecovery ? 'Ukryj pomoc' : 'PIN nie działa?'}
          </button>

          {showRecovery && (
            <div className="mt-4 space-y-2 text-left">
              <p className="text-xs text-slate-400">
                Jeśli wcześniej zmieniłeś PIN i go nie pamiętasz, możesz go przywrócić. Twoje kafelki i grafik zostaną zachowane.
              </p>
              <button
                type="button"
                onClick={() => {
                  onResetPin()
                  setPin(DEFAULT_ADMIN_PIN)
                  setError(false)
                  if (onLogin(DEFAULT_ADMIN_PIN)) return
                }}
                className="w-full py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-sm font-semibold"
              >
                Przywróć PIN na {DEFAULT_ADMIN_PIN}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('To usunie CAŁĄ konfigurację (kafelki, grafik, instrukcje) i przywróci ustawienia przykładowe. Kontynuować?')) {
                    onFullReset()
                    setPin(DEFAULT_ADMIN_PIN)
                    setError(false)
                    onLogin(DEFAULT_ADMIN_PIN)
                  }
                }}
                className="w-full py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 text-sm font-semibold border border-red-500/30"
              >
                Reset całej strony (ostateczność)
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

import { useState } from 'react'

interface AdminLoginProps {
  onLogin: (pin: string) => boolean
  onClose: () => void
}

export function AdminLogin({ onLogin, onClose }: AdminLoginProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onLogin(pin)) return
    setError(true)
    setPin('')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-strong rounded-3xl p-8 w-full max-w-sm text-center"
      >
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-xl font-bold mb-2">Panel administratora</h2>
        <p className="text-sm text-slate-400 mb-6">Wpisz PIN, aby zarządzać stroną startową</p>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError(false)
          }}
          placeholder="PIN"
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-2xl tracking-[0.5em] font-mono outline-none ${
            error ? 'border-red-500 shake' : 'border-white/10 focus:border-violet-500'
          }`}
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mt-2">Nieprawidłowy PIN</p>}
        <button
          type="submit"
          className="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold transition"
        >
          Wejdź
        </button>
        <p className="text-[10px] text-slate-600 mt-4">Domyślny PIN: 2024 — zmień go w panelu</p>
      </form>
    </div>
  )
}

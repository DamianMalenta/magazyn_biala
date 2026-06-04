import type { ReactNode } from 'react'
import { isPhoneDevice } from '../../lib/device/isDesktop'
import { APP_URL } from '../../lib/data/instructionContent'

interface DesktopOnlyGuardProps {
  children: ReactNode
}

export function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  if (!isPhoneDevice()) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-center">
      <div className="max-w-md rounded-2xl border border-rose-500/40 bg-rose-950/20 p-8 shadow-2xl">
        <span className="text-5xl mb-4 block" aria-hidden>
          🖥️
        </span>
        <h1 className="text-xl font-black text-white mb-3">Tylko komputer w pracy</h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Magazyn <strong>nie działa na telefonie</strong>. Aktualizacje stanów wykonujecie wyłącznie
          na komputerze w lokalu — tak mamy jedną, wspólną bazę na tym urządzeniu.
        </p>
        <ul className="text-left text-xs text-slate-400 space-y-2 mb-6 list-disc pl-5">
          <li>Otwórz magazyn na komputerze w pracy</li>
          <li>Wklej wiadomość z Messengera w Smart Paste</li>
          <li>Kliknij „Przetwórz tekst”</li>
        </ul>
        <p className="text-[11px] text-slate-500 font-mono break-all">{APP_URL}</p>
        <p className="mt-4 text-[10px] text-slate-600">
          Na telefonie możecie tylko czytać wiadomości na grupie — nie wprowadzajcie stanów w
          aplikacji.
        </p>
      </div>
    </div>
  )
}

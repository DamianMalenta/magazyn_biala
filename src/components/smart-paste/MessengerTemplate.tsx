import { useState } from 'react'
import { MESSENGER_RULES_SHORT, MESSENGER_TEMPLATE } from '../../lib/data/messengerTemplate'

export function MessengerTemplate() {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MESSENGER_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-slate-200 transition"
      >
        <span>Szablon dla Messengera (dla pracowników)</span>
        <span className="text-slate-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-800">
          <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
            {MESSENGER_RULES_SHORT.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>

          <pre className="text-[10px] leading-relaxed text-slate-400 font-mono whitespace-pre-wrap bg-slate-900 rounded-lg p-2 border border-slate-800 max-h-48 overflow-y-auto">
            {MESSENGER_TEMPLATE}
          </pre>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="w-full rounded-lg border border-slate-700 hover:border-emerald-600 text-xs font-bold uppercase py-2 text-slate-300 hover:text-emerald-400 transition"
          >
            {copied ? 'Skopiowano ✓' : 'Kopiuj szablon do schowka'}
          </button>
        </div>
      )}
    </div>
  )
}

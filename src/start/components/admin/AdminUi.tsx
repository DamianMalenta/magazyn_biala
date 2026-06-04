import type { QuickLink } from '../../types'

export const inputCls =
  'w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 text-sm transition'

export const btnPrimary =
  'px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition disabled:opacity-40 disabled:pointer-events-none'

export const btnGhost =
  'px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition'

export const btnDanger =
  'px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-sm font-medium transition'

export function TabHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-white/10">
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">{label}</span>
      {hint && <span className="text-xs text-slate-600 mb-1.5 block">{hint}</span>}
      {children}
    </label>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm text-slate-300"
    >
      <span
        className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-violet-600' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
      {label}
    </button>
  )
}

export function TilePreview({ link, size = 'md' }: { link: QuickLink; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-24 h-24' : 'w-32 h-32'
  const iconSize = size === 'sm' ? 'text-3xl' : 'text-4xl'

  return (
    <div
      className={`${dim} relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 shrink-0`}
    >
      <div className="absolute inset-0 rounded-2xl opacity-30 blur-xl" style={{ background: link.color }} />
      <span className={`${iconSize} relative`}>{link.icon}</span>
      <span className="relative text-[10px] font-bold uppercase tracking-wide text-center px-1 truncate w-full">
        {link.label}
      </span>
      {!link.pinned && (
        <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          ukryty
        </span>
      )}
    </div>
  )
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-lg animate-in fade-in">
      {message}
    </div>
  )
}

export const ICON_PRESETS = ['🧾', '📧', '📘', '🏭', '🍽️', '⭐', '🛒', '📱', '💳', '📊', '🔗', '📞', '🔐', '📶']

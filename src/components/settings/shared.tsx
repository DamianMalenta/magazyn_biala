import type { ReactNode } from 'react'

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
      <header>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </header>
      {children}
    </section>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
      {children}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-violet-500 ${className}`}
    />
  )
}

export function BtnPrimary({
  children,
  onClick,
  disabled,
  variant = 'violet',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'violet' | 'emerald' | 'rose' | 'sky'
}) {
  const colors = {
    violet: 'bg-violet-600 hover:bg-violet-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    sky: 'bg-sky-600 hover:bg-sky-500',
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg text-white text-xs font-bold uppercase px-4 py-2 transition disabled:opacity-40 ${colors[variant]}`}
    >
      {children}
    </button>
  )
}

export function BtnGhost({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs text-slate-500 hover:text-slate-300 transition ${className}`}
    >
      {children}
    </button>
  )
}

export function TagList({
  items,
  onRemove,
  color = 'slate',
}: {
  items: string[]
  onRemove?: (item: string) => void
  color?: 'slate' | 'violet' | 'amber'
}) {
  const bg = { slate: 'bg-slate-800', violet: 'bg-violet-900/40', amber: 'bg-amber-900/30' }[color]
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`inline-flex items-center gap-1 rounded-md ${bg} border border-slate-700 px-2 py-1 text-xs text-slate-200`}
        >
          {item}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-slate-500 hover:text-rose-400 ml-0.5"
              aria-label={`Usuń ${item}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {items.length === 0 && <span className="text-xs text-slate-600 italic">Brak wpisów</span>}
    </div>
  )
}

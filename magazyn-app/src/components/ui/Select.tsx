import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      )}
      <select
        className={`rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

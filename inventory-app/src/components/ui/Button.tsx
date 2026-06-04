import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white',
  ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-300 border border-slate-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-wide transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

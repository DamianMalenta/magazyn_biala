import { cn } from '@/lib/utils'

export function Badge({
  children,
  className,
  tone = 'neutral',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const tones = {
    neutral: 'bg-slate-700 text-slate-200',
    success: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
    warning: 'bg-amber-900/40 text-amber-200 border border-amber-600/40',
    danger: 'bg-red-900/50 text-red-200 border border-red-600/50',
    info: 'bg-blue-900/40 text-blue-200 border border-blue-600/40',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

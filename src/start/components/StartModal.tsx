import { useEffect, type ReactNode } from 'react'

interface StartModalProps {
  open: boolean
  onClose: () => void
  title: string
  icon?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const MAX_W = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const

export function StartModal({ open, onClose, title, icon, children, maxWidth = 'md' }: StartModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="start-modal-root" role="dialog" aria-modal="true" aria-labelledby="start-modal-title">
      <button type="button" className="start-modal-backdrop" onClick={onClose} aria-label="Zamknij" />
      <div className={`start-modal-panel ${MAX_W[maxWidth]}`}>
        <header className="start-modal-header">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-lg shrink-0">{icon}</span>}
            <h2 id="start-modal-title" className="text-base font-bold truncate">
              {title}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="start-modal-close" aria-label="Zamknij okno">
            ×
          </button>
        </header>
        <div className="start-modal-body">{children}</div>
      </div>
    </div>
  )
}

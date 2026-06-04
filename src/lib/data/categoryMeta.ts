import type { Category } from '../../types/inventory'

export const CATEGORY_META: Record<
  Category,
  { label: string; accent: string; border: string; bg: string; icon: string }
> = {
  LODÓWKA: {
    label: 'Lodówka',
    accent: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/5',
    icon: '❄️',
  },
  ZAMRAŻARKA: {
    label: 'Zamrażarka',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    icon: '🧊',
  },
  OPAKOWANIA: {
    label: 'Opakowania',
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: '📦',
  },
}

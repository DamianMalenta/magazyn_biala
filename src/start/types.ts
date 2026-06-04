export type IconMode = 'auto' | 'manual'

export type DayKey = 'pon' | 'wt' | 'sr' | 'czw' | 'pt' | 'sob' | 'nd'

export const DAY_KEYS: DayKey[] = ['pon', 'wt', 'sr', 'czw', 'pt', 'sob', 'nd']

export const DAY_LABELS: Record<DayKey, string> = {
  pon: 'Pon',
  wt: 'Wt',
  sr: 'Śr',
  czw: 'Czw',
  pt: 'Pt',
  sob: 'Sob',
  nd: 'Nd',
}

export interface QuickLink {
  id: string
  label: string
  url: string
  icon: string
  iconMode: IconMode
  color: string
  pinned: boolean
}

export interface InfoCard {
  id: string
  title: string
  content: string
  icon: string
  pinned: boolean
}

export interface Employee {
  id: string
  name: string
  color: string
  role: string
}

export interface ShiftEntry {
  employeeId: string
  start: string
  end: string
  note?: string
}

export type WeekSchedule = Record<DayKey, ShiftEntry[]>

export interface HandoverNote {
  id: string
  author: string
  content: string
  createdAt: string
  pinned: boolean
  done: boolean
  doneAt?: string
  doneBy?: string
}

export interface PageSections {
  showSearch: boolean
  showQuickLinks: boolean
  showSchedule: boolean
  showHandover: boolean
  showInfoCards: boolean
  showShiftPulse: boolean
}

export interface StartPageConfig {
  version: 1
  companyName: string
  tagline: string
  adminPin: string
  quickLinks: QuickLink[]
  infoCards: InfoCard[]
  employees: Employee[]
  schedule: WeekSchedule
  handoverNotes: HandoverNote[]
  searchEngine: 'google' | 'duckduckgo'
  sections: PageSections
}

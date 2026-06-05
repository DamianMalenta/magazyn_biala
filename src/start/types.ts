export type IconMode = 'auto' | 'manual'
/** `shell` = pełne okno z paskiem panelu (iframe + muzyka w tle). */
export type LinkOpenMode = 'tab' | 'embed' | 'window' | 'shell'
/** `music` = wbudowany odtwarzacz audio (bez iframe / YouTube). */
export type QuickLinkType = 'link' | 'music'
export type EmbedSize = 'compact' | 'medium' | 'large' | 'fullscreen'

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
  linkType?: QuickLinkType
  openMode: LinkOpenMode
  embedSize: EmbedSize
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
  mentions: string[]
  createdAt: string
  pinned: boolean
  done: boolean
  doneAt?: string
  doneBy?: string
}

export interface WeatherConfig {
  city: string
  latitude: number | null
  longitude: number | null
}

export type WindowsShortcutTargetType = 'web' | 'protocol' | 'info'

export interface WindowsShortcut {
  id: string
  label: string
  icon: string
  description?: string
  /** URL, protokół (np. calculator:) lub tekst instrukcji */
  target: string
  targetType: WindowsShortcutTargetType
  enabled: boolean
}

export interface WorkspaceSettings {
  /** Wymuś pełny ekran przy starcie strony (F11 / Fullscreen API). */
  forceFullscreen: boolean
  /** Po wyjściu z pełnego ekranu — automatycznie wróć (tylko gdy forceFullscreen). */
  lockFullscreen: boolean
  /** Domyślny sposób otwierania nowych kafelków. */
  defaultLinkOpenMode: LinkOpenMode
  /** Adres panelu do skryptów Windows (auto-wykrywany, można nadpisać). */
  panelUrl: string
  /** Skróty Windows / narzędzia widoczne na pasku powłoki. */
  windowsShortcuts: WindowsShortcut[]
}

export interface PageSections {
  showSearch: boolean
  showQuickLinks: boolean
  showSchedule: boolean
  showHandover: boolean
  showInfoCards: boolean
  showShiftPulse: boolean
  showWeather: boolean
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
  weather: WeatherConfig
  sections: PageSections
  workspace: WorkspaceSettings
}

import { DEFAULT_CONFIG, DEFAULT_SECTIONS, DEFAULT_WORKSPACE, DEMO_WEEK_SCHEDULE } from './defaultConfig'
import { DEFAULT_SHIFT_PRESETS, normalizeShiftPreset } from './shiftPresets'
const DEFAULT_WEATHER = DEFAULT_CONFIG.weather
import { normalizeQuickLink } from './faviconUtils'
import { normalizeHandoverNote } from './handoverUtils'
import { emptyWeekSchedule } from './scheduleUtils'
import { getWeekKey } from './weekCalendar'
import type { LinkOpenMode, ScheduleByWeek, StartPageConfig, WeekSchedule } from '../types'

const STORAGE_KEY = 'startpage-config-v1'
export const DEFAULT_ADMIN_PIN = '2024'

type LegacyStartPageConfig = Partial<StartPageConfig> & { schedule?: Partial<WeekSchedule> }

export function normalizePin(pin: string | undefined): string {
  const trimmed = pin?.trim()
  return trimmed && trimmed.length >= 4 ? trimmed : DEFAULT_ADMIN_PIN
}

function normalizeQuickLinks(
  links: StartPageConfig['quickLinks'],
  defaultOpenMode: LinkOpenMode,
): StartPageConfig['quickLinks'] {
  return links.map((link) => normalizeQuickLink(link, defaultOpenMode))
}

function mergeWorkspace(parsed: Partial<StartPageConfig>['workspace']): StartPageConfig['workspace'] {
  const base = DEFAULT_WORKSPACE
  if (!parsed) return { ...base, windowsShortcuts: [...base.windowsShortcuts] }
  return {
    ...base,
    ...parsed,
    barPosition: parsed.barPosition ?? base.barPosition,
    barHeight: parsed.barHeight ?? base.barHeight,
    windowsShortcuts: parsed.windowsShortcuts ?? base.windowsShortcuts,
  }
}

function mergeShiftPresets(parsed: StartPageConfig['shiftPresets'] | undefined): StartPageConfig['shiftPresets'] {
  const source = parsed?.length ? parsed : DEFAULT_SHIFT_PRESETS
  return source.map(normalizeShiftPreset)
}

/** Nie mieszaj zapisanego grafiku z domyślnymi godzinami demo — brakujące dni = puste. */
export function mergeSchedule(parsed: Partial<WeekSchedule> | undefined): WeekSchedule {
  if (!parsed) return emptyWeekSchedule()
  return { ...emptyWeekSchedule(), ...parsed }
}

export function mergeSchedules(
  parsed: ScheduleByWeek | undefined,
  legacySchedule?: Partial<WeekSchedule>,
): ScheduleByWeek {
  const currentKey = getWeekKey()

  if (parsed && Object.keys(parsed).length > 0) {
    const result: ScheduleByWeek = {}
    for (const [weekKey, week] of Object.entries(parsed)) {
      result[weekKey] = mergeSchedule(week)
    }
    return result
  }

  if (legacySchedule) {
    return { [currentKey]: mergeSchedule(legacySchedule) }
  }

  return { [currentKey]: structuredClone(DEMO_WEEK_SCHEDULE) }
}

function mergeConfig(parsed: LegacyStartPageConfig): StartPageConfig {
  const workspace = mergeWorkspace(parsed.workspace)
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    adminPin: normalizePin(parsed.adminPin),
    sections: { ...DEFAULT_SECTIONS, ...parsed.sections },
    weather: { ...DEFAULT_WEATHER, ...parsed.weather },
    workspace,
    quickLinks: normalizeQuickLinks(parsed.quickLinks ?? DEFAULT_CONFIG.quickLinks, workspace.defaultLinkOpenMode),
    infoCards: parsed.infoCards ?? DEFAULT_CONFIG.infoCards,
    shiftPresets: mergeShiftPresets(parsed.shiftPresets),
    employees: parsed.employees ?? DEFAULT_CONFIG.employees,
    schedules: mergeSchedules(parsed.schedules, parsed.schedule),
    handoverNotes: (parsed.handoverNotes ?? DEFAULT_CONFIG.handoverNotes).map(normalizeHandoverNote),
  }
}

export function isFirstVisit(): boolean {
  return localStorage.getItem(STORAGE_KEY) === null
}

export function loadConfig(): StartPageConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return mergeConfig({})
    return mergeConfig(JSON.parse(raw) as LegacyStartPageConfig)
  } catch {
    return mergeConfig({})
  }
}

export function saveConfig(config: StartPageConfig): void {
  const normalizedSchedules: ScheduleByWeek = {}
  for (const [weekKey, week] of Object.entries(config.schedules)) {
    normalizedSchedules[weekKey] = mergeSchedule(week)
  }

  const safe: StartPageConfig = {
    ...config,
    adminPin: normalizePin(config.adminPin),
    quickLinks: normalizeQuickLinks(config.quickLinks, config.workspace.defaultLinkOpenMode),
    handoverNotes: config.handoverNotes.map(normalizeHandoverNote),
    schedules: normalizedSchedules,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
}

export function resetConfig(): StartPageConfig {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem('startpage-admin-session')
  return mergeConfig({})
}

export function resetAdminPin(): StartPageConfig {
  const config = loadConfig()
  const fixed = { ...config, adminPin: DEFAULT_ADMIN_PIN }
  saveConfig(fixed)
  sessionStorage.removeItem('startpage-admin-session')
  return fixed
}

export function exportConfig(config: StartPageConfig): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `startpage-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importConfig(file: File): Promise<{ ok: true; config: StartPageConfig } | { ok: false; error: string }> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as LegacyStartPageConfig
    if (!parsed.version) {
      return { ok: false, error: 'Nieprawidłowy plik — brak wersji konfiguracji.' }
    }
    const config = mergeConfig(parsed)
    saveConfig(config)
    sessionStorage.removeItem('startpage-admin-session')
    return { ok: true, config }
  } catch {
    return { ok: false, error: 'Nie udało się wczytać pliku JSON.' }
  }
}

export function uid(): string {
  return crypto.randomUUID().slice(0, 8)
}

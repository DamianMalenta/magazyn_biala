import { DEFAULT_CONFIG, DEFAULT_SECTIONS, DEFAULT_WORKSPACE } from './defaultConfig'
const DEFAULT_WEATHER = DEFAULT_CONFIG.weather
import { normalizeQuickLink } from './faviconUtils'
import { normalizeHandoverNote } from './handoverUtils'
import type { StartPageConfig } from '../types'

const STORAGE_KEY = 'startpage-config-v1'
export const DEFAULT_ADMIN_PIN = '2024'

export function normalizePin(pin: string | undefined): string {
  const trimmed = pin?.trim()
  return trimmed && trimmed.length >= 4 ? trimmed : DEFAULT_ADMIN_PIN
}

function normalizeQuickLinks(links: StartPageConfig['quickLinks']): StartPageConfig['quickLinks'] {
  return links.map(normalizeQuickLink)
}

function mergeWorkspace(parsed: Partial<StartPageConfig>['workspace']): StartPageConfig['workspace'] {
  const base = DEFAULT_WORKSPACE
  if (!parsed) return { ...base, windowsShortcuts: [...base.windowsShortcuts] }
  return {
    ...base,
    ...parsed,
    windowsShortcuts: parsed.windowsShortcuts ?? base.windowsShortcuts,
  }
}

function mergeConfig(parsed: Partial<StartPageConfig>): StartPageConfig {
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    adminPin: normalizePin(parsed.adminPin),
    sections: { ...DEFAULT_SECTIONS, ...parsed.sections },
    weather: { ...DEFAULT_WEATHER, ...parsed.weather },
    workspace: mergeWorkspace(parsed.workspace),
    quickLinks: normalizeQuickLinks(parsed.quickLinks ?? DEFAULT_CONFIG.quickLinks),
    infoCards: parsed.infoCards ?? DEFAULT_CONFIG.infoCards,
    employees: parsed.employees ?? DEFAULT_CONFIG.employees,
    schedule: { ...DEFAULT_CONFIG.schedule, ...parsed.schedule },
    handoverNotes: (parsed.handoverNotes ?? DEFAULT_CONFIG.handoverNotes).map(normalizeHandoverNote),
  }
}

export function isFirstVisit(): boolean {
  return localStorage.getItem(STORAGE_KEY) === null
}

export function loadConfig(): StartPageConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_CONFIG)
    return mergeConfig(JSON.parse(raw) as Partial<StartPageConfig>)
  } catch {
    return structuredClone(DEFAULT_CONFIG)
  }
}

export function saveConfig(config: StartPageConfig): void {
  const safe = {
    ...config,
    adminPin: normalizePin(config.adminPin),
    quickLinks: normalizeQuickLinks(config.quickLinks),
    handoverNotes: config.handoverNotes.map(normalizeHandoverNote),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
}

export function resetConfig(): StartPageConfig {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem('startpage-admin-session')
  return structuredClone(DEFAULT_CONFIG)
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
    const parsed = JSON.parse(text) as Partial<StartPageConfig>
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

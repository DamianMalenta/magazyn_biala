import { DEFAULT_CONFIG } from './defaultConfig'
import type { StartPageConfig } from '../types'

const STORAGE_KEY = 'startpage-config-v1'

function mergeConfig(parsed: Partial<StartPageConfig>): StartPageConfig {
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    quickLinks: parsed.quickLinks ?? DEFAULT_CONFIG.quickLinks,
    infoCards: parsed.infoCards ?? DEFAULT_CONFIG.infoCards,
    employees: parsed.employees ?? DEFAULT_CONFIG.employees,
    schedule: { ...DEFAULT_CONFIG.schedule, ...parsed.schedule },
    handoverNotes: parsed.handoverNotes ?? DEFAULT_CONFIG.handoverNotes,
  }
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function resetConfig(): StartPageConfig {
  localStorage.removeItem(STORAGE_KEY)
  return structuredClone(DEFAULT_CONFIG)
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
    return { ok: true, config }
  } catch {
    return { ok: false, error: 'Nie udało się wczytać pliku JSON.' }
  }
}

export function uid(): string {
  return crypto.randomUUID().slice(0, 8)
}

import type { WorkspaceSettings } from '../types'

export function resolvePanelUrl(configured: string): string {
  const trimmed = configured.trim()
  if (trimmed) return trimmed
  if (typeof window !== 'undefined') return window.location.href.split('#')[0]
  return 'https://damianmalenta.github.io/magazyn_biala/start.html'
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadChromeAppBat(panelUrl: string) {
  const content = `@echo off
REM Panel startowy — Chrome w trybie aplikacji (bez paska adresu)
set PANEL_URL=${panelUrl}
start "" chrome.exe --app="%PANEL_URL%" --start-fullscreen
`
  downloadText('uruchom-panel.bat', content)
}

export function downloadChromeKioskBat(panelUrl: string) {
  const content = `@echo off
REM Panel startowy — Chrome kiosk (pełny ekran, bez paska)
set PANEL_URL=${panelUrl}
start "" chrome.exe --kiosk "%PANEL_URL%"
`
  downloadText('uruchom-panel-kiosk.bat', content)
}

export function downloadWindowsStartupBat(panelUrl: string) {
  const content = `@echo off
REM Instalacja autostartu Windows — skrót w folderze Startup
set PANEL_URL=${panelUrl}
set STARTUP=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup
echo Tworzenie skrótu autostartu...
powershell -NoProfile -Command ^
  "$s = New-Object -ComObject WScript.Shell; ^
   $sc = $s.CreateShortcut('%STARTUP%\\Panel-Restauracji.lnk'); ^
   $sc.TargetPath = 'chrome.exe'; ^
   $sc.Arguments = '--app=%PANEL_URL% --start-fullscreen'; ^
   $sc.WorkingDirectory = '%USERPROFILE%'; ^
   $sc.Save()"
echo Gotowe. Panel uruchomi sie przy nastepnym logowaniu do Windows.
pause
`
  downloadText('instaluj-autostart-windows.bat', content)
}

export function downloadChromeStartupInstructions(panelUrl: string): string {
  return `1. Chrome → Ustawienia → Uruchamianie → „Otwórz konkretną stronę”
2. Dodaj adres: ${panelUrl}
3. W panelu admina włącz „Wymuś pełny ekran” i zapisz backup JSON na pozostałe PC`
}

export function launchWindowsShortcut(target: string, targetType: WorkspaceSettings['windowsShortcuts'][0]['targetType']): boolean {
  if (targetType === 'info') return false
  if (targetType === 'web') {
    window.open(target, '_blank', 'noopener,noreferrer')
    return true
  }
  try {
    const a = document.createElement('a')
    a.href = target
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    return true
  } catch {
    return false
  }
}

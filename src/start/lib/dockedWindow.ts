import type { WorkspaceSettings } from '../types'

export const DEFAULT_BAR_HEIGHT = 52

export function dockWindowName(linkId: string): string {
  return `biala-dock-${linkId}`
}

export function contentAreaBounds(barHeight: number, barPosition: WorkspaceSettings['barPosition']) {
  const screenObj = window.screen as Screen & { availLeft?: number; availTop?: number }
  const left = screenObj.availLeft ?? 0
  const topBase = screenObj.availTop ?? 0
  const width = window.screen.availWidth
  const fullHeight = window.screen.availHeight
  const contentHeight = Math.max(200, fullHeight - barHeight)

  if (barPosition === 'bottom') {
    return { left, top: topBase, width, height: contentHeight }
  }
  return { left, top: topBase + barHeight, width, height: contentHeight }
}

export function windowFeatures(bounds: ReturnType<typeof contentAreaBounds>): string {
  return [
    `width=${bounds.width}`,
    `height=${bounds.height}`,
    `left=${bounds.left}`,
    `top=${bounds.top}`,
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
    'scrollbars=yes',
    'resizable=yes',
  ].join(',')
}

export function openDockedContent(
  url: string,
  linkId: string,
  barHeight: number,
  barPosition: WorkspaceSettings['barPosition'],
): Window | null {
  const name = dockWindowName(linkId)
  const bounds = contentAreaBounds(barHeight, barPosition)
  const features = windowFeatures(bounds)
  const win = window.open(url, name, features)
  if (win) {
    try {
      win.moveTo(bounds.left, bounds.top)
      win.resizeTo(bounds.width, bounds.height)
      win.focus()
    } catch {
      /* cross-origin lub polityka przeglądarki */
    }
  }
  return win
}

export function focusDockedWindow(win: Window | null, barHeight: number, barPosition: WorkspaceSettings['barPosition']) {
  if (!win || win.closed) return
  const bounds = contentAreaBounds(barHeight, barPosition)
  try {
    win.moveTo(bounds.left, bounds.top)
    win.resizeTo(bounds.width, bounds.height)
    win.focus()
  } catch {
    try {
      win.focus()
    } catch {
      /* ignore */
    }
  }
}

export function hideDockedWindow(win: Window | null) {
  if (!win || win.closed) return
  try {
    win.moveTo(-20000, -20000)
    win.resizeTo(1, 1)
  } catch {
    /* ignore */
  }
}

export function closeDockedWindow(win: Window | null) {
  if (!win || win.closed) return
  try {
    win.close()
  } catch {
    /* ignore */
  }
}

/** Bazowa ścieżka aplikacji (np. `/magazyn_biala/` na GitHub Pages). */
function appBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  return new URL(base, window.location.origin).href
}

/** Rozwiązuje adres skrótu względem domeny / bazy aplikacji (nie względem bieżącej podstrony). */
export function resolveQuickLinkUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  try {
    if (trimmed.includes('://')) return new URL(trimmed).href
    if (trimmed.startsWith('/')) return new URL(trimmed, window.location.origin).href
    return new URL(trimmed, appBaseUrl()).href
  } catch {
    return trimmed
  }
}

function parseTargetUrl(url: string): URL | null {
  try {
    return new URL(resolveQuickLinkUrl(url))
  } catch {
    return null
  }
}

function isSameDocument(a: URL, b: URL): boolean {
  return a.origin === b.origin && a.pathname === b.pathname && a.search === b.search
}

/** Czy URL to moduł własny (ta sama domena). */
export function isInternalModuleUrl(url: string): boolean {
  const target = parseTargetUrl(url)
  if (!target) return false
  if (target.origin !== window.location.origin) return false
  try {
    const current = new URL(window.location.href)
    if (isSameDocument(target, current)) return false
  } catch {
    /* ignore */
  }
  return true
}

/** Adres do osadzenia modułu własnego (np. magazyn) — mapuje katalogi i start.html na index.html. */
export function resolveInternalEmbedUrl(url: string): string {
  const target = parseTargetUrl(url)
  if (!target) return url

  let pathname = target.pathname
  if (/start\.html$/i.test(pathname)) {
    pathname = pathname.replace(/start\.html$/i, 'index.html')
  } else {
    const last = pathname.split('/').pop() ?? ''
    if (pathname.endsWith('/') || !last.includes('.')) {
      pathname = `${pathname.replace(/\/?$/, '')}/index.html`
    }
  }
  target.pathname = pathname
  return target.href
}

/** Adres iframe w trybie „pod paskiem” — zawsze wewnątrz tego samego okna przeglądarki. */
export function resolveShellFrameUrl(url: string): string {
  const resolved = resolveQuickLinkUrl(url)
  if (isInternalModuleUrl(resolved)) return resolveInternalEmbedUrl(url)
  return resolved
}

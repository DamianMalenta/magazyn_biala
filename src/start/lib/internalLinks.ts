/** Czy URL to moduł własny (ta sama domena) — wyświetlany pod paskiem ekranu głównego. */
export function isInternalModuleUrl(url: string): boolean {
  try {
    const target = new URL(url.includes('://') ? url : new URL(url, window.location.href).href)
    if (target.origin !== window.location.origin) return false
    return !target.pathname.includes('start.html')
  } catch {
    return false
  }
}

/** Adres do osadzenia modułu własnego (np. magazyn) pod paskiem. */
export function resolveInternalEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url.includes('://') ? url : new URL(url, window.location.href).href)
    const last = parsed.pathname.split('/').pop() ?? ''
    if (parsed.pathname.endsWith('/') || !last.includes('.')) {
      parsed.pathname = `${parsed.pathname.replace(/\/?$/, '')}/index.html`
    }
    return parsed.href
  } catch {
    return url
  }
}

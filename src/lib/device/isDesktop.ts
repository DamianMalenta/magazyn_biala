/**
 * Wykrywa telefony — magazyn jest tylko na komputer (decyzja operacyjna).
 * Tablety z szerokim ekranem mogą przejść; telefony — blokada.
 */
export function isPhoneDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  const ua = navigator.userAgent

  // Klasyczne telefony w User-Agent
  if (/iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true
  }

  // Wąski ekran dotykowy (typowy telefon)
  const narrow = window.innerWidth < 768
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (narrow && touch) return true

  return false
}

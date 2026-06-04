import type { StartPageConfig } from '../types'

export const DEFAULT_CONFIG: StartPageConfig = {
  version: 1,
  companyName: 'Biała Restauracja',
  tagline: 'Panel startowy zespołu',
  adminPin: '2024',
  searchEngine: 'google',
  quickLinks: [
    {
      id: 'pos',
      label: 'POS',
      url: 'https://pos.example.com',
      icon: '🧾',
      color: '#10b981',
      pinned: true,
    },
    {
      id: 'mail',
      label: 'Poczta',
      url: 'https://mail.google.com',
      icon: '📧',
      color: '#3b82f6',
      pinned: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      url: 'https://www.facebook.com',
      icon: '📘',
      color: '#1877f2',
      pinned: true,
    },
    {
      id: 'magazyn',
      label: 'Magazyn',
      url: 'https://damianmalenta.github.io/magazyn_biala/',
      icon: '🏭',
      color: '#f59e0b',
      pinned: true,
    },
    {
      id: 'smartlunch',
      label: 'SmartLunch',
      url: 'https://smartlunch.pl',
      icon: '🍽️',
      color: '#ec4899',
      pinned: true,
    },
  ],
  infoCards: [
    {
      id: 'wifi',
      title: 'Wi-Fi gościnne',
      content: 'Sieć: Restauracja_Gosc\nHasło: zapytaj kierownika',
      icon: '📶',
      pinned: true,
    },
    {
      id: 'alarm',
      title: 'Alarm / zamknięcie',
      content: '1. Wyłącz piec i frytkownicę\n2. Sprawdź drzwi tylne\n3. Włącz alarm — kod w notesie kierownika',
      icon: '🔐',
      pinned: true,
    },
    {
      id: 'kontakt',
      title: 'Kontakt awaryjny',
      content: 'Kierownik: +48 500 000 000\nSerwis POS: +48 600 000 000',
      icon: '📞',
      pinned: true,
    },
  ],
  employees: [
    { id: 'e1', name: 'Anna', color: '#10b981', role: 'Kuchnia' },
    { id: 'e2', name: 'Piotr', color: '#3b82f6', role: 'Sala' },
    { id: 'e3', name: 'Kasia', color: '#f59e0b', role: 'Bar' },
    { id: 'e4', name: 'Marek', color: '#ec4899', role: 'Magazyn' },
  ],
  schedule: {
    pon: [
      { employeeId: 'e1', start: '08:00', end: '16:00' },
      { employeeId: 'e2', start: '10:00', end: '18:00' },
      { employeeId: 'e4', start: '07:00', end: '15:00' },
    ],
    wt: [
      { employeeId: 'e3', start: '12:00', end: '20:00' },
      { employeeId: 'e2', start: '10:00', end: '18:00' },
    ],
    sr: [
      { employeeId: 'e1', start: '08:00', end: '16:00' },
      { employeeId: 'e4', start: '07:00', end: '15:00' },
    ],
    czw: [
      { employeeId: 'e3', start: '12:00', end: '20:00' },
      { employeeId: 'e2', start: '10:00', end: '18:00' },
    ],
    pt: [
      { employeeId: 'e1', start: '08:00', end: '16:00' },
      { employeeId: 'e2', start: '10:00', end: '22:00' },
      { employeeId: 'e3', start: '14:00', end: '22:00' },
    ],
    sob: [
      { employeeId: 'e2', start: '10:00', end: '22:00' },
      { employeeId: 'e3', start: '12:00', end: '22:00' },
    ],
    nd: [],
  },
  handoverNotes: [
    {
      id: 'h1',
      author: 'System',
      content: 'Tu wpisuj ważne info między zmianami — np. brakujące produkty, rezerwacje VIP, usterki sprzętu.',
      createdAt: new Date().toISOString(),
      pinned: true,
    },
  ],
}

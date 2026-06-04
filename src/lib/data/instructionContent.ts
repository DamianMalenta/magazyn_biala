export const APP_URL = 'https://damianmalenta.github.io/magazyn_biala/'

export interface InstructionStep {
  id: string
  step: number
  title: string
  description: string
  image: string
  imageAlt: string
}

export interface InstructionRule {
  type: 'ok' | 'warn' | 'info'
  text: string
}

export const QUICK_STEPS = [
  'Renament: stan faktyczny → wiadomość na grupę Messenger.',
  'Na PC: kopiuj renament → Smart Paste → Przetwórz tekst.',
  'Przywóz/wywóz w ciągu dnia: tylko +/− na komputerze (bez Messengera).',
  'Porównaj system z rzeczywistością po renamencie.',
  'Aplikacja tylko na komputerze w pracy — nie na telefonie.',
] as const

export const INSTRUCTION_STEPS: InstructionStep[] = [
  {
    id: 'overview',
    step: 1,
    title: 'Otwórz magazyn',
    description:
      'Wejdź w link magazynu. Po lewej jest Smart Paste, po prawej lista towarów na stanie. Na górze możesz dodać nowy produkt ręcznie.',
    image: '01-pelny-widok.png',
    imageAlt: 'Pełny widok aplikacji Magazyn Główny',
  },
  {
    id: 'paste',
    step: 2,
    title: 'Wklej wiadomość z Messengera',
    description:
      'Skopiuj całą wiadomość ze stanem (jeden blok tekstu). Wklej w pole Smart Paste. Możesz wcisnąć Demo, żeby zobaczyć przykład.',
    image: '04-demo-wklejony-tekst.png',
    imageAlt: 'Wklejony tekst i przycisk Przetwórz tekst',
  },
  {
    id: 'template',
    step: 3,
    title: 'Jak pisać stan (szablon)',
    description:
      'Każda strefa zaczyna się od nagłówka: zamrażalnik, lodówka lub opakowania. Pod spodem każdy towar w nowej linii, np. 4x nugetsy, 2 kg ser mozzarella.',
    image: '03-szablon-messenger.png',
    imageAlt: 'Szablon wiadomości dla Messengera',
  },
  {
    id: 'result',
    step: 4,
    title: 'Po przetworzeniu',
    description:
      'Zielone wpisy w logu = rozpoznane towary. Po prawej widać tylko produkty na stanie (ilość większa niż 0).',
    image: '05-po-przetworzeniu.png',
    imageAlt: 'Magazyn po przetworzeniu wiadomości',
  },
  {
    id: 'manual',
    step: 5,
    title: 'Poprawka ręczna',
    description:
      'Kliknij liczbę między przyciskami − i +, wpisz ilość, Enter. Jednostkę zmienisz w menu pod liczbą: szt, kg lub opak.',
    image: '06-reczna-ilosc-jednostka.png',
    imageAlt: 'Ręczna zmiana ilości i jednostki',
  },
]

export const PHONE_POLICY_NOTE =
  'Renament możecie wpisać na grupę z telefonu. Aplikację magazynu (wklejanie +/−) obsługujecie tylko na komputerze w pracy.'

export const INSTRUCTION_RULES: InstructionRule[] = [
  {
    type: 'ok',
    text: 'Renament (Messenger): okresowa kontrola — liczycie na miejscu i wpisujecie faktyczny stan na grupę, potem przetwarzacie na PC.',
  },
  {
    type: 'ok',
    text: 'Przywóz / wywóz w trakcie dnia: tylko przyciski + i − na komputerze. Nie trzeba pisać na Messengerze.',
  },
  {
    type: 'warn',
    text: 'Renament tylko lodówki → w wiadomości sam nagłówek lodówka + towary. Inne strefy w systemie bez zmian.',
  },
  {
    type: 'warn',
    text: 'Renament całej strefy → wypisujecie wszystko co jest. Brak na liście = 0 w systemie.',
  },
  {
    type: 'info',
    text: 'Kwarantanna (czerwone)? Wybierz towar z listy → OK.',
  },
]

export { MESSENGER_TEMPLATE, MESSENGER_RULES_SHORT } from './messengerTemplate'

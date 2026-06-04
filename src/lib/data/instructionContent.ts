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
  'Stan wpisujecie na grupę Messenger (każdy po zmianie).',
  'Na komputerze w pracy otwórz link magazynu (nie telefon).',
  'Skopiuj całą wiadomość ze stanem z grupy.',
  'Wklej w Smart Paste → Przetwórz tekst.',
  'Po prawej — tylko towary na stanie.',
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
  'Stan piszecie na grupę Messenger z telefonu. Magazyn w aplikacji — tylko na komputerze w pracy (wklejenie i przetworzenie).'

export const INSTRUCTION_RULES: InstructionRule[] = [
  {
    type: 'ok',
    text: 'W wiadomości jest tylko lodówka → zmienia się tylko lodówka. Zamrażarka i opakowania zostają bez zmian.',
  },
  {
    type: 'warn',
    text: 'Wysyłasz całą strefę → wypisz wszystko, co jest na stanie. Czego nie ma na liście, system ustawi na 0 (zniknie z widoku).',
  },
  {
    type: 'info',
    text: 'Czerwona kwarantanna? Wybierz właściwy towar z listy → OK. Możesz zaznaczyć „zapamiętaj alias”.',
  },
]

export { MESSENGER_TEMPLATE, MESSENGER_RULES_SHORT } from './messengerTemplate'

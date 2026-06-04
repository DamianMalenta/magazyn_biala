/** Gotowy szablon wiadomości dla pracowników (Messenger). */
export const MESSENGER_TEMPLATE = `Magazyn — DD.MM.RRRR GG:MM

zamrażalnik
4x nugetsy
5x skrzydełka
2x szyszki
1x papryka worek
1x polędwiczki surowe worek
1 pojemnik krewetek
3 kg frytki

lodówka
2x jogurt grecki
2 kg ser mozzarella
7x salami zwykle
1x sos czosnkowy

opakowania
10x kartony małe
50 opakowań na makarony
20 x wieczka na makarony
1 sztućce (łyżka i nóż)`

export const MESSENGER_RULES_SHORT = [
  'Każda strefa zaczyna się od nagłówka: zamrażalnik / lodówka / opakowania',
  'Format: ilość + jednostka + nazwa (np. 4x nugetsy, 2 kg ser mozzarella)',
  'x lub szt = sztuki · kg = kilogramy · op / worek / pojemnik = opakowania',
  'Aktualizujesz tylko jedną strefę? Wklej tylko jej nagłówek i towary z tej strefy',
  'Nie wymieniony towar w danej strefie = uznajemy, że go nie ma (stan 0)',
]

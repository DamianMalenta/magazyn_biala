# Wdrożenie strony startowej Chrome w pracy

## Czy magazyn nadal działa?

**Tak — nic nie zostało zmienione w aplikacji magazynu.**

Strona startowa to **osobny plik** (`start.html`), obok dotychczasowej aplikacji (`index.html`). Magazyn działa pod tym samym adresem co wcześniej:

| Aplikacja | Adres |
|-----------|--------|
| **Magazyn** (Smart Paste, stany) | https://damianmalenta.github.io/magazyn_biala/ |
| **Strona startowa** (nowa) | https://damianmalenta.github.io/magazyn_biala/start.html |

Dane magazynu (stany, aliasy) i dane strony startowej (grafik, kafelki) zapisują się **osobno** w przeglądarce.

---

## Wdrożenie na komputerze w pracy (bez instalacji Node)

To wystarczy na każdym stanowisku — POS, biuro, kuchnia.

### 1. Sprawdź, czy magazyn działa

Otwórz w Chrome:

https://damianmalenta.github.io/magazyn_biala/

Powinieneś zobaczyć dotychczasowy panel magazynu — Smart Paste, stany, instrukcja.

### 2. Otwórz stronę startową

https://damianmalenta.github.io/magazyn_biala/start.html

### 3. Ustaw jako nową kartę w Chrome

1. Wejdź w **Chrome Web Store**
2. Wyszukaj: **Custom New Tab URL** (autor: Marcin Olejniczak)  
   alternatywa: **New Tab Redirect**
3. Zainstaluj rozszerzenie
4. W ustawieniach rozszerzenia wklej URL:
   ```
   https://damianmalenta.github.io/magazyn_biala/start.html
   ```
5. Otwórz nową kartę (`Ctrl+T`) — powinien pojawić się Twój panel

### 4. Pierwsza konfiguracja (tylko raz, na głównym komputerze)

1. Na stronie startowej kliknij **⚙️ Panel admina**
2. PIN domyślny: **2024** — **zmień go od razu** w zakładce Ogólne
3. Ustaw kafelki (POS, mail, Facebook, magazyn, SmartLunch)
4. Wpisz instrukcje (Wi-Fi, alarm, telefony)
5. Uzupełnij grafik tygodniowy
6. **Backup → Eksportuj JSON** — zapisz plik na pendrive lub dysku

### 5. Pozostałe komputery w pracy

Na każdym kolejnym stanowisku:

1. Ustaw rozszerzenie Chrome (krok 3)
2. Wejdź w panel admina → **Backup → Importuj JSON**
3. Wczytaj plik z głównego komputera

Od tej chwili wszystkie stanowiska mają tę samą konfigurację.

---

## Skrót kafelka „Magazyn”

W panelu admina kafelek Magazyn domyślnie prowadzi do:

https://damianmalenta.github.io/magazyn_biala/

Pracownik klika kafelek 🏭 na stronie startowej i trafia prosto do magazynu.

---

## Aktualizacje

Po każdej zmianie w repozytorium GitHub Pages odświeża się automatycznie (ok. 1–2 minuty po pushu na `main`).

Na komputerach w pracy **nie trzeba nic instalować ponownie** — wystarczy odświeżyć stronę (`F5`).

Konfiguracja (grafik, kafelki) zostaje w przeglądarce — chyba że zrobisz reset lub import nowego JSON.

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---------|-------------|
| Magazyn nie ładuje się | Sprawdź internet; wejdź bezpośrednio na adres magazynu |
| Nowa karta nie pokazuje panelu | Sprawdź URL w rozszerzeniu Chrome |
| Inna konfiguracja na dwóch PC | Eksport JSON z jednego → import na drugim |
| Zapomniałem PIN-u | Backup → Reset (utrata własnej config) lub import wcześniejszego JSON |

---

## Opcjonalnie: uruchomienie lokalne (tylko do testów)

Jeśli kiedyś będziesz chciał testować na własnym PC z kodem:

```bash
git clone https://github.com/DamianMalenta/magazyn_biala.git
cd magazyn_biala
npm install
npm run dev
```

- Magazyn: http://localhost:5173/
- Strona startowa: http://localhost:5173/start.html

Do pracy na co dzień **wystarczy wersja online** — npm nie jest potrzebny.

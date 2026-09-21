# Plan poprawek wizualnych Dashboardu Administratora

Ten dokument przedstawia szczegółowy plan usprawnień interfejsu (UI/UX) dla panelu głównego administratora w pliku `src/pages/panel/admin/AdminDashboard.tsx`. Zmiany mają na celu uproszczenie wyglądu, nadanie mu bardziej nowoczesnego charakteru (premium) oraz poprawę czytelności danych bez modyfikacji logiki biznesowej i zapytań do bazy danych Supabase.

---

## 1. Karty Statystyk (Liczba rezerwacji, Potwierdzone wizyty, Aktywni Klienci)

### Proponowane zmiany:
* **Uproszczenie tła:** Zastąpienie pełnych gradientowych teł (`from-blue-50`, `from-emerald-50`, `from-purple-50`) czystą bielą (`bg-white`).
* **Akcenty kolorystyczne:** Zachowanie kolorowych lewych krawędzi (np. `border-l-blue-500` / `emerald-500` / `purple-500`) jako subtelnych wskaźników kategorii.
* **Nowoczesne opakowanie dla ikon:** Ikony statystyk (np. `CalendarDays`, `CheckCircle`, `Users`) zostaną umieszczone w prawym górnym rogu w małych, okrągłych kontenerach z delikatnym, pastelowym tłem o kryciu 10% (np. `bg-blue-500/10 text-blue-600`), zamiast dotychczasowych wielkich, półprzezroczystych ikon.
* **Typografia i ułożenie:** Pogrubienie etykiet statystyk oraz optymalizacja wielkości czcionki liczb.
* **Lepszy Hover:** Dodanie animacji podnoszenia karty o 2-4px w górę (`hover:-translate-y-1 transition-all duration-300`) oraz dodanie miękkiego cienia (`hover:shadow-md`).
* **Czytelniejsze Tooltipy:** Delikatne dopasowanie opóźnienia i cieni dymków z podpowiedziami, aby pojawiały się płynnie i nie nachodziły na siebie.

---

## 2. Tabela „Ostatnie rezerwacje”

### Proponowane zmiany:
* **Odświeżenie wierszy:** Zwiększenie paddingów pionowych w komórkach tabeli (`py-4`), co da więcej przestrzeni dla danych.
* **Nowoczesne Statusy (Pills):** Zmiana stylizacji plakietek statusu na bardziej spójną i minimalistyczną:
  - **Potwierdzona:** `bg-emerald-50 text-emerald-700 border-emerald-100` (bardzo miękki zielony)
  - **Zrealizowana:** `bg-blue-50 text-blue-700 border-blue-100` (miękki niebieski)
  - **Anulowana:** `bg-red-50 text-red-700 border-red-100` (miękki czerwony)
  - **Oczekująca/Inna:** `bg-amber-50 text-amber-700 border-amber-100` (miękki bursztynowy)
* **Wyróżnienie pierwszej wizyty:** Zmniejszenie rzucania się w oczy plakietki `1sza wizyta` – zmiana koloru tła na bardzo jasny beż/neutral, aby nie konkurowała ze statusami wizyty, i dodanie małej ikonki (np. mała gwiazdka/znacznik).
* **Nagłówek tabeli:** Delikatne rozjaśnienie tła nagłówka (`bg-gray-50/50`) z ciemniejszym, czytelniejszym tekstem o wyższym kontraście (`text-gray-500`).

---

## 3. Oś czasu „Ostatnia aktywność”

### Proponowane zmiany:
* **Delikatniejsza linia czasu:** Zmiana pionowej linii łączącej zdarzenia na cieńszą i przerywaną (`border-l border-dashed border-gray-200`) w celu zmniejszenia szumu wizualnego.
* **Stylowe przełączniki filtrów:** Przebudowa przycisków wyboru aktywności (Wszystkie, Pacjenci, Admin):
  - Użycie bardziej minimalistycznego, zaokrąglonego kontenera z szarym tłem.
  - Płynne animacje przejścia stanów aktywny/nieaktywny.
* **Dedykowany pasek przewijania:** Dodanie niestandardowych klas CSS dla paska przewijania (np. cienki, zaokrąglony pasek przewijania w kolorze leśnej zieleni/szarości), aby domyślny systemowy suwak nie zaburzał estetyki interfejsu.
* **Wyróżnienie typów zdarzeń:** Użycie spójnych kolorów w zależności od rodzaju zalogowanej akcji (fioletowy akcent dla admina, niebieski dla pacjenta).

---

## 4. Weryfikacja zmian

* **Automatyczne testy:** Sprawdzenie poprawności kompilacji projektu przy użyciu `npm run build` lub `npx tsc --noEmit`.
* **Weryfikacja wizualna:** Sprawdzenie zachowania komponentów na różnych rozdzielczościach ekranu (responsywność) przy użyciu narzędzi deweloperskich.

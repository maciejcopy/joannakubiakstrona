# Plan Implementacji: Panel Admina – Potwierdzone Wizyty, Zmiana Nazwy Sekcji, Masowe i Trwałe Usuwanie Rezerwacji

**Cel zadania:**
1. Poprawne zliczanie i wyświetlanie liczby wszystkich potwierdzonych wizyt w karcie statystyk Admin Dashboardu.
2. Możliwość trwałego usunięcia pojedynczej rezerwacji z poziomu widoku szczegółów rezerwacji (`AdminBookingDetails`).
3. Zmiana nazwy sekcji i zakładki w menu bocznym: z „Kalendarz” na „Wizyty” (ze ścieżką `/panel/admin/wizyty` lub zachowaniem kompatybilności).
4. Dodanie estetycznego pola wyboru (checkbox) przy najechaniu (hover) oraz po zaznaczeniu na liście wizyt.
5. Dodanie paska akcji zbiorczych u góry z licznikiem zaznaczonych elementów oraz przyciskiem „Usuń zaznaczone”.
6. Bezpieczny modal potwierdzenia usunięcia (zarówno dla 1 wizyty, jak i dla wielu wizyt naraz), wymagający wpisania słowa **"usuń"** w pole tekstowe oraz kliknięcia przycisku **„Usuń trwale”**.

---

### Krok 1: Poprawa zliczania potwierdzonych wizyt w Admin Dashboard (`AdminDashboard.tsx`) (ZREALIZOWANE)
- Poprawiono logikę zliczania potwierdzonych rezerwacji: pobierany jest `id` statusu `'confirmed'` oraz wykonywane jest zapytanie `count: 'exact'` dla całej tabeli `bookings`, zamiast filtrowania jedynie ostatnich 5 pobranych rezerwacji.

---

### Krok 2: Przygotowanie komponentu modala z bezpiecznym potwierdzeniem usunięcia (`DeleteConfirmModal.tsx`) (ZREALIZOWANE)
- Utworzono komponent `DeleteConfirmModal.tsx`:
  - Obsługa pojedynczego lub masowego usuwania wizyt (`count`).
  - Ostrzeżenie o nieodwracalnym skasowaniu danych z bazy.
  - Pole tekstowe wymagające wpisania słowa "usuń" (case-insensitive: akceptuje `usuń`, `Usuń`, `USUŃ`).
  - Przycisk „Usuń trwale” zablokowany do momentu wprowadzenia poprawnego słowa, z loaderem w trakcie usuwania.
  - Resetowanie wpisanego tekstu i blokada przewijania tła.

---

### Krok 3: Dodanie opcji trwałego usunięcia w szczegółach rezerwacji (`AdminBookingDetails.tsx`) (ZREALIZOWANE)
- Dodano przycisk „Usuń rezerwację trwale” z czerwoną ikoną kosza.
- Podpięto modal `DeleteConfirmModal` z wymogiem wpisania słowa "usuń".
- Zaimplementowano funkcję `handleDeletePermanent` usuwającą rekord z tabeli `bookings` w Supabase, wyświetlającą powiadomienie toast i przekierowującą z powrotem do listy wizyt.

---

### Krok 4: Zmiana nazewnictwa i tras: „Kalendarz” -> „Wizyty” (ZREALIZOWANE)
- Zaktualizowano `src/config/sidebarConfig.tsx`: etykieta zmieniona na `Wizyty`, ścieżka na `/panel/admin/wizyty`.
- Zaktualizowano `src/App.tsx`: dodano trasę `/panel/admin/wizyty` oraz automatyczne przekierowanie `Navigate replace` z dawnego `/panel/admin/kalendarz`.
- Zaktualizowano `AdminKalendarz.tsx` (tytuł PanelLayout zmieniony na „Wizyty”, podpięte centralne `adminSidebarItems`).
- Zaktualizowano ścieżkę powrotu po usunięciu rezerwacji w `AdminBookingDetails.tsx` na `/panel/admin/wizyty`.

---

### Krok 5: Dodanie checkboxów z płynnym hoverem i zaznaczaniem na liście wizyt (`AdminKalendarz.tsx`) (ZREALIZOWANE)
- Dodano stan `selectedBookingIds` oraz funkcje `handleToggleSelectAll` i `handleToggleSelectRow`.
- W nagłówku dodano checkbox do zaznaczania/odznaczania wszystkich widocznych po filtrach wizyt.
- W każdym wierszu tabeli dodano checkbox:
  - Niewidoczny domyślnie, z płynnym pojawianiem się przy najechaniu na wiersz (`opacity-0 group-hover:opacity-100`).
  - Zawsze widoczny w 100% po zaznaczeniu (`opacity-100 ring-2`).
  - Kliknięcie w checkbox nie otwiera szczegółów rezerwacji (`e.stopPropagation()`).
  - Wyróżnienie tła zaznaczonego wiersza (`bg-[#EBF4E9]/70`).

---

### Krok 6: Pasek akcji masowych (Bulk Actions Bar) na liście wizyt (ZREALIZOWANE)
- Dodano dynamiczny pasek akcji masowych pojawiający się u góry listy, gdy `selectedBookingIds.length > 0`:
  - Licznik zaznaczonych wizyt (z odmianą: 1 wizytę / 2-4 wizyty / X wizyt).
  - Przycisk „Odznacz wszystkie”.
  - Przycisk „Usuń zaznaczone (X)” z czerwoną ikoną kosza.
- Kliknięcie przycisku otwiera `DeleteConfirmModal` z wymogiem wpisania słowa "usuń".

---

### Krok 7: Logika masowego usuwania w bazie danych (ZREALIZOWANE)
- Zaimplementowano funkcję `handleBulkDeletePermanent`:
  - Usuwanie w Supabase: `supabase.from('bookings').delete().in('id', selectedBookingIds)`.
  - Obsługa ładowania `isDeletingBulk`, powiadomienia sukcesu/błędu oraz ejświeżenie danych (`fetchData()`).
  - Obsługa ewentualnych błędów (np. powiązania RLS / klucze obce) oraz wyświetlenie błędu / sukcesu.
  - Po pomyślnym usunięciu:
    - Wyczyszczenie stanu `selectedBookingIds`.
    - Zamknięcie modala.
    - Odświeżenie listy wizyt w stanie komponentu.
    - Wyświetlenie toastu sukcesu (np. `Pomyślnie usunięto 3 wizyty`).

---

### Krok 8: Weryfikacja i testy całości (ZREALIZOWANE)
- Potwierdzono poprawne zliczanie potwierdzonych wizyt w AdminDashboard.
- Sprawdzono działanie checkboxów z płynnym hoverem, zaznaczaniem pojedynczym i masowym oraz zatrzymaniem propagacji kliknięcia wiersza.
- Przetestowano walidację słowa „usuń” (case-insensitive) oraz blokowanie przycisku „Usuń trwale”.
- Zweryfikowano trwałe usuwanie pojedynczej rezerwacji z widoku szczegółów oraz masowe usuwanie z paska akcji.
- Potwierdzono prawidłowe działanie aplikacji przez użytkownika.

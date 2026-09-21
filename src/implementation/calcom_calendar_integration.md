# Plan Wdrożenia - Integracja Terminarza Cal.com

Niniejszy dokument szczegółowo opisuje wdrożenie oficjalnego kalendarza Cal.com na stronie internetowej w celu automatyzacji rezerwacji wizyt dla pacjentów oraz ich synchronizacji z bazą danych Supabase.

---

## 📋 Podsumowanie Zmian

1. **Baza Danych (Supabase):** 
   * Dodanie pól `source` oraz `external_id` w tabeli `bookings` (śledzenie źródła rezerwacji).
   * Dodanie pola `cal_slug` w tabeli `visit_types` (dynamiczne przypisywanie linków Cal.com do usług).
2. **Kreator Rezerwacji (Frontend):** Dodanie biblioteki `@calcom/embed-react` i przebudowa Kroku 2 w `BookingWizard.tsx` na nowoczesny układ dwukolumnowy (kalendarz po lewej, portret Joanny i opis pakietów po prawej).
3. **Automatyczne Uzupełnianie:** Przekazywanie danych zalogowanego pacjenta (imię, email, telefon) i metadanych (Supabase user ID) do Cal.com. Domyślny profil to `joanna-kubiak-0ojprl`, a domyślny slug to `konsultacja-indywidualna`.
4. **Backend (Webhook):** Supabase Edge Function (`calcom-webhook`) odbierający zdarzenia z Cal.com i aktualizujący statusy w bazie Supabase.
5. **Dashboard Admina:** Wyświetlanie etykiety źródła wizyty (np. "Strona WWW", "Offline") w tabeli wizyt oraz pole do edycji sluga w panelu sesji.

---

## 🛠️ Krok po Kroku

### Krok 1: Modyfikacja bazy danych w Supabase

W tabeli `bookings` potrzebujemy śledzić, skąd pochodzi rezerwacja (strona WWW, ZnanyLekarz, offline) oraz przechowywać unikalny identyfikator zewnętrznego systemu. W tabeli `visit_types` przechowamy slug usługi Cal.com.

W bazie danych wykonamy zapytanie SQL:
```sql
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS external_id text UNIQUE;

ALTER TABLE public.visit_types
  ADD COLUMN IF NOT EXISTS cal_slug text;

UPDATE public.visit_types 
  SET cal_slug = 'konsultacja-indywidualna'
  WHERE title ILIKE '%indywidualna%';
```

* `source` pozwoli na łatwe filtrowanie wizyt w panelu i odróżnienie wizyt ze strony od tych, które w przyszłości pobierze n8n.
* `external_id` (np. `evt_12345` z Cal.com) zabezpiecza przed podwójnym zapisaniem tej samej rezerwacji przez webhooki.
* `cal_slug` pozwala administratorowi powiązać usługę w bazie z kalendarzem Cal.com.

### Krok 2: Instalacja i konfiguracja `@calcom/embed-react`

1. Instalacja paczki w katalogu głównym projektu:
   ```bash
   npm install @calcom/embed-react
   ```
2. Modyfikacja pliku [BookingWizard.tsx](file:///c:/Users/macie/OneDrive/Pulpit/coding%20lessons/joannakubiakstrona-1/src/pages/rezerwacja/BookingWizard.tsx).
3. Zastąpienie kroku wyboru terminu (krok 2) dwukolumnowym układem:
   * **Lewa kolumna (szerokość 60% / `lg:col-span-3`):** Komponent `<Cal>` skonfigurowany pod branding Joanny:
     ```typescript
     import Cal, { getCalApi } from "@calcom/embed-react";
     // ...
     useEffect(() => {
       (async function () {
         const cal = await getCalApi();
         cal("ui", {
           styles: { branding: { brandColor: "#2F5C3A" } },
           hideEventTypeDetails: true, // Ukrywa domyślne logo/avatar Cal
           layout: "month_view"
         });
       })();
     }, []);
     ```
   * **Prawa kolumna (szerokość 40% / `lg:col-span-2`):** Zdjęcie Joanny, cennik wybranej usługi, informacja o płatnościach.
4. **Dane klienta:** W parametrze `config` komponentu `<Cal>` przekazujemy dane pacjenta:
   ```typescript
   config={{
     name: fullName,
     email: email,
     phone: phoneNumber,
     "metadata[userId]": userId, // Id użytkownika w Supabase
     "metadata[visitTypeId]": selectedVisitType.id // Id typu wizyty
   }}
   ```
   Nazwa kalendarza to `joanna-kubiak-0ojprl`, a link do konkretnego wydarzenia to dynamiczne: `joanna-kubiak-0ojprl/${selectedVisitType.cal_slug || 'konsultacja-indywidualna'}`.

### Krok 3: Stworzenie Edge Function `calcom-webhook`

W folderze `supabase/functions/calcom-webhook/` tworzymy plik `index.ts`. Zadaniem funkcji będzie nasłuchiwanie zdarzeń typu POST od Cal.com:

1. **`BOOKING_CREATED`**: 
   * Odczyt metadanych `userId` i `visitTypeId`.
   * Zapis do tabeli `bookings` w Supabase (status `confirmed`, status płatności `unpaid`, lokalizacja zgodna z typem usługi, `source = 'website'`, `external_id = payload.uid`).
2. **`BOOKING_CANCELLED`**:
   * Zmiana statusu na `cancelled` i uzupełnienie `cancelled_at`.
3. **`BOOKING_RESCHEDULED`**:
   * Aktualizacja pola `scheduled_at` na nową datę.

### Krok 4: Aktualizacja panelu admina ([AdminKalendarz.tsx](file:///c:/Users/macie/OneDrive/Pulpit/coding%20lessons/joannakubiakstrona-1/src/pages/panel/admin/AdminKalendarz.tsx) i [AdminSesje.tsx](file:///c:/Users/macie/OneDrive/Pulpit/coding%20lessons/joannakubiakstrona-1/src/pages/panel/admin/AdminSesje.tsx))

1. Zmiana zapytania pobierającego wizyty, aby uwzględniało kolumnę `source`.
2. Wyświetlenie etykiety (badge) w tabeli przy rezerwacji:
   * Zielona: `Strona WWW` (jeśli `source === 'website'`)
   * Szara: `Ręczna` (jeśli `source === 'offline'`)
3. Aktualizacja formularza w `AdminSesje.tsx`, aby admin mógł edytować i zapisywać `cal_slug` dla każdej usługi.

---

## 🧪 Plan Weryfikacji

### Testy Kompilacji:
1. Uruchomienie `npm run build`, aby upewnić się, że TypeScript i Vite poprawnie kompilują nowy komponent.

### Testy Funkcjonalne:
1. Zalogowanie się na konto testowe pacjenta.
2. Wejście w Kreator Rezerwacji i wybór usługi.
3. Sprawdzenie, czy formularz Cal.com poprawnie zaczytuje imię, e-mail i telefon zalogowanego pacjenta.
4. Złożenie testowej rezerwacji i sprawdzenie, czy w bazie Supabase pojawił się nowy wiersz z odpowiednim `client_id`, `external_id` i `source = 'website'`.
5. Sprawdzenie, czy w panelu admina wizyta wyświetla się z zieloną etykietą "Strona WWW".

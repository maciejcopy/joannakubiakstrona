# Plan Implementacji: Odwoływanie i Przekładanie Wizyt (min. 24h) z Obsługą Cal.com API v2 i Statusem Zwrotu P24

## 1. Cel i Kontekst
Wdrożenie pełnego procesu samodzielnego odwoływania i przekładania wizyt przez pacjenta w Panelu Pacjenta (`PacjentDashboard.tsx`) w oparciu o Cal.com API v2 oraz bazę danych Supabase:
- **Zasada 24h:** Samodzielna zmiana terminu lub odwołanie możliwe wyłącznie na ≥ 24h przed wizytą. Poniżej 24h akcje są zablokowane z informacją o kontakcie z gabinetem.
- **Zwroty:** Odwołanie ≥ 24h wizyty opłaconej online nadaje status płatności `refund_pending` („Oczekuje na zwrot”). Administrator wykonuje zwrot ręcznie w Przelewy24 i oznacza w systemie jako `refunded` („Zwrócona”).
- **Przełożenie terminu:** Realizowane przez modal z osadzonym widgetem Cal.com (`rescheduleUid`). Zachowuje istniejący status płatności i nie duplikuje wierszy w bazie.

---

## 2. Zakres prac

### Krok 1: Konfiguracja reguł w panelu Cal.com (Czynność manualna)
- **Miejsce:** Panel Cal.com -> Typy zdarzeń (Event Types) oraz Webhooks
- **Zadania do wykonania:**
  1. **Minimalne wyprzedzenie rezerwacji (24h):** W zakładce *Limits* typu zdarzenia ustawić *Minimum notice* = `24 hours` (zapobiega rezerwacjom „z marszu” na ten sam dzień).
  2. **Weryfikacja webhooka:** Upewnić się, że w webhooku do Supabase zaznaczone są zdarzenia: `Rezerwacja Utworzona` (`BOOKING_CREATED`), `Rezerwacja Przełożona` (`BOOKING_RESCHEDULED`) oraz `Anulowano rezerwację` (`BOOKING_CANCELLED`).
  *(Uwaga: Zgodnie z decyzją, cała logika blokady odwoływania/przekładania < 24h jest w 100% egzekwowana w kodzie aplikacji i Edge Function, maile Cal.com na tym etapie pozostają bez zmian).*

### Krok 2: Dodanie statusów płatności w bazie Supabase (`payment_statuses`) [ZREALIZOWANO]
- **Miejsce:** Baza Supabase (tabela `public.payment_statuses`)
- **Zadanie:** Dodanie dwóch nowych rekordów statusów płatności:
  - `name`: `'refund_pending'`, `label`: `'Oczekuje na zwrot'`, `description`: `'Wizyta anulowana na min. 24h przed terminem. Płatność oczekuje na ręczny zwrot przez administratora w Przelewy24.'`
  - `name`: `'refunded'`, `label`: `'Zwrócona'`, `description`: `'Środki zostały zwrócone pacjentowi.'`

### Krok 3: Nowa Edge Function do odwoływania rezerwacji (`calcom-cancel-booking`) [ZREALIZOWANO]
- **Nowy plik:** `supabase/functions/calcom-cancel-booking/index.ts` (wdrożony w Supabase)
- **Zadanie:** Bezpieczny endpoint backendowy:
  1. Weryfikacja sesji użytkownika JWT (`supabase.auth.getUser()`).
  2. Sprawdzenie, czy rezerwacja należy do zalogowanego pacjenta (lub administratora).
  3. **Serwerowa walidacja 24h:** Jeśli do terminu wizyty zostało `< 24h`, zwrot błędu HTTP 400 z komunikatem o konieczności kontaktu telefonicznego.
  4. Wywołanie Cal.com API v2:
     - `POST https://api.cal.com/v2/bookings/${external_id}/cancel`
     - Nagłówek `Authorization: Bearer ${CALCOM_API_KEY}`
     - Nagłówek **`cal-api-version: 2026-02-25`**
     - Body: `{ "cancellationReason": "Odwołano przez pacjenta w panelu pacjenta" }`
  5. Aktualizacja rekordu w tabeli `bookings`:
     - `status_id` na ID statusu `cancelled`
     - `cancelled_at` = `now()`
     - `cancellation_reason` = powód anulowania
     - Jeśli dotychczasowy status płatności to `paid_online` ➔ zmiana na `refund_pending`. W pozostałych przypadkach status płatności pozostaje bez zmian.

### Krok 4: Aktualizacja Edge Function webhooka (`calcom-webhook`) [ZREALIZOWANO]
- **Modyfikowany plik:** `supabase/functions/calcom-webhook/index.ts` (wdrożony w Supabase)
- **Zadanie:** Poprawna obsługa przełożenia terminu (reschedule) bez duplikatów:
  1. **Obsługa zdarzenia `BOOKING_RESCHEDULED`:**
     - Pobranie `payload.rescheduleUid` (stary UID) oraz `payload.uid` (nowy UID).
     - Wyszukanie rezerwacji w tabeli `bookings` po starym UID (`external_id = payload.rescheduleUid`).
     - Aktualizacja rekordu: zmiana `scheduled_at = payload.startTime`, podmiana `external_id = payload.uid`, zachowanie dotychczasowego `payment_status_id`.
  2. **Zabezpieczenie zdarzenia `BOOKING_CREATED`:**
     - Jeśli w payloadzie występuje `rescheduleUid`, zignorowanie tworzenia nowego rekordu (obsługuje go `BOOKING_RESCHEDULED`).

### Krok 5: Rozbudowa Panelu Pacjenta (`PacjentDashboard.tsx`) [ZREALIZOWANO]
- **Modyfikowany plik:** `src/pages/panel/pacjent/PacjentDashboard.tsx`
- **Zadanie:**
  1. Pobieranie w zapytaniu pól `external_id` oraz relacji `payment_statuses(name, label)`.
  2. **Umiejscowienie akcji:** Przyciski „Odwołaj wizytę” i „Przełóż termin” znajdują się w szczegółach rezerwacji (po kliknięciu w daną wizytę).
  3. **Widoczność i stan przycisków (Reguła 24h):**
     - Przyciski są widoczne **zawsze**.
     - **Gdy ≥ 24h:** Przyciski są aktywne (enabled).
     - **Gdy < 24h:** Przyciski są nieaktywne (disabled), a po kliknięciu lub pod nimi wyświetla się czytelny komunikat:
       *„Do wizyty zostało mniej niż 24 godziny. Zmiana terminu lub odwołanie możliwe jest wyłącznie po kontakcie z gabinetem (tel. +48 729 933 833).”*
  4. **Obsługa odwołania wizyty:**
     - Modal z potwierdzeniem:
       - Dla wizyt opłaconych online: *„Wizyta zostanie anulowana. Środki zostaną zwrócone na rachunek, z którego dokonano płatności.”*
       - Dla pozostałych: *„Czy na pewno chcesz odwołać tę wizytę?”*
     - Wywołanie funkcji `calcom-cancel-booking`, stan ładowania i powiadomienie toast.
  5. **Obsługa przełożenia wizyty:**
     - Modal z osadzonym widgetem `<Cal />` z parametrem `rescheduleUid=${booking.external_id}`.
     - Po zakończeniu wyboru nowego terminu zamknięcie modalu i automatyczne odświeżenie listy wizyt.

### Krok 6: Obsługa statusów zwrotu w Panelu Administratora (`AdminKalendarz.tsx` / `AdminBookingDetails.tsx`) [ZREALIZOWANO]
- **Modyfikowane pliki:** `src/pages/panel/admin/AdminKalendarz.tsx` oraz `src/pages/panel/admin/AdminBookingDetails.tsx`
- **Zadanie:**
  1. Wyświetlanie etykiety `Oczekuje na zwrot` (`refund_pending`) w kolorze bursztynowym/pomarańczowym dla anulowanych wizyt opłaconych online.
  2. Przycisk dla administratora „Oznacz jako zwrócone” aktualizujący status płatności z `refund_pending` na `refunded`.

---

## 3. Plan Weryfikacji
- [x] W tabeli `payment_statuses` w Supabase istnieją statusy `refund_pending` i `refunded`.
- [x] Reguły 24h w Cal.com są aktywne (brak możliwości rezerwacji < 24h od teraz).
- [ ] W Panelu Pacjenta wizyty z terminem < 24h mają zablokowaną modyfikację i widoczny baner z numerem telefonu.
- [ ] Odwołanie wizyty ≥ 24h opłaconej online:
  - Odwołuje termin w Cal.com / Google Calendar (przez API v2 z nagłówkiem `cal-api-version: 2026-02-25`).
  - Ustawia status wizyty na `cancelled` w Supabase.
  - Ustawia status płatności na `refund_pending`.
- [ ] Przełożenie wizyty ≥ 24h przez modal Cal.com:
  - Przenosi termin w Google Calendar.
  - Aktualizuje `scheduled_at` oraz `external_id` w Supabase.
  - Nie tworzy drugiego, zduplikowanego rekordu w tabeli `bookings`.
  - Pozostawia status płatności `paid_online`.
- [x] W panelu administratora widoczny jest status `Oczekuje na zwrot` z możliwością oznaczenia jako `Zwrócona`.
- [x] Sprawdzenie poprawności typowania TypeScript (`npx tsc --noEmit`).

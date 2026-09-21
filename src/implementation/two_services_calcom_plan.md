# Plan Implementacji: Dodanie usługi stacjonarnej oraz dynamicznych linków Cal.com

Plik dokumentacji: `src/implementation/two_services_calcom_plan.md`

## Krok 1: Weryfikacja i przygotowanie struktury tabeli `visit_types` w Supabase
1. Sprawdź obecność kolumny `cal_slug` (typ `text`) w tabeli `public.visit_types`.
2. Zaktualizuj definicję w pliku `supabase/schema.sql`, dopisując `cal_slug text` do definicji tabeli `visit_types`, aby lokalny schemat bazy odzwierciedlał produkcję.

## Krok 2: Aktualizacja istniejącej usługi Online w Supabase (przez MCP execute_sql)
1. Zmień nazwę usługi o id `38ec6e38-dc1a-4ee3-a062-7a9a8dcf070e`:
   - `title`: `"Konsultacja indywidualna – ONLINE"`
   - `cal_slug`: `"konsultacja-indywidualna"`
   - Upewnij się, że `is_active = true`.

## Krok 3: Dodanie nowej usługi Stacjonarnej w Supabase (przez MCP execute_sql)
1. Wstaw nowy wiersz do tabeli `public.visit_types`:
   - `title`: `"Konsultacja indywidualna – STACJONARNIE"`
   - `price`: `220`
   - `duration`: `50`
   - `description`: `"Konsultacja psychologiczna stacjonarna w gabinecie."`
   - `cal_slug`: `"konsultacja-indywidualna-stacjonarnie"`
   - `is_active`: `true`

## Krok 4: Aktualizacja panelu administratora (`src/pages/panel/admin/AdminSesje.tsx`)
1. Sprawdź i dostosuj obsługę pola `cal_slug` lub pełnego linku Cal.com w formularzu dodawania/edycji usługi:
   - Zapewnij pole tekstowe z przejrzystym opisem i placeholderem (np. `konsultacja-indywidualna-stacjonarnie` lub pełny link Cal.com z automatycznym czyszczeniem do sluga).
   - Upewnij się, że wartość jest poprawnie wysyłana w `insert` oraz `update` do Supabase.
   - Wyświetl `cal_slug` na liście kart usług w panelu administratora.

## Krok 5: Dynamiczny link Cal.com w kreatorze rezerwacji (`src/pages/rezerwacja/BookingWizard.tsx`)
1. Zweryfikuj pobieranie pola `cal_slug` w zapytaniu do tabeli `visit_types`.
2. Zaktualizuj komponent `<Cal />` w kroku wyboru terminu (krok 2):
   - Dynamicznie konstruuj `calLink` w oparciu o `selectedVisitType.cal_slug`.
   - Zaimplementuj obsługę awaryjną (fallback) lub komunikat o braku konfiguracji kalendarza, gdy `cal_slug` jest pusty.

## Krok 6: Sprawdzenie i poprawienie powiązanych modułów w kodzie
1. **Edge Function `supabase/functions/calcom-webhook/index.ts`**:
   - Sprawdź logikę dopasowania typu wizyty w webhooku (`visit_types`), gdy zapytanie nie zawiera metadanych `visitTypeId`.
   - Sprawdź logikę przypisywania lokalizacji (`isOffice` / `officeLocation` vs `onlineLocation`). Zapewnij regułę dopasowującą wizytę do lokalizacji stacjonarnej na podstawie słów kluczowych `stacjonarnie` / `gabinet` lub na podstawie wybranego `visit_type`.
2. **Panel Pacjenta (`src/pages/panel/pacjent/PacjentDashboard.tsx`)**:
   - Sprawdź modal przekładania wizyty (reschedule Cal.com widget) — upewnij się, że pobiera i używa `booking.visit_types.cal_slug`.
3. **Funkcja płatności (`supabase/functions/p24-create-transaction/index.ts`)**:
   - Zweryfikuj, że pobieranie ceny i tytułu odbywa się w pełni dynamicznie z `visit_types` na podstawie `booking.visit_type_id`.
4. **Pozostałe panele administratora (`AdminKalendarz.tsx`, `AdminBookingDetails.tsx`, `AdminClientDetails.tsx`)**:
   - Zweryfikuj, że filtry i etykiety typów wizyt opierają się na dynamicznych danych z tabeli `visit_types`.

## Krok 7: Instrukcja testów manualnych dla użytkownika
1. **Test Panelu Administratora (`/panel/admin/sesje`)**:
   - Zaloguj się na konto administratora.
   - Wejdź w zakładkę Sesje.
   - Zweryfikuj obecność obu usług: "Konsultacja indywidualna – ONLINE" oraz "Konsultacja indywidualna – STACJONARNIE" z poprawnymi cenami (200 zł / 220 zł) i slugami Cal.com.
   - Przetestuj edycję usługi stacjonarnej oraz dodanie testowej usługi z nowym linkiem Cal.com.
2. **Test Kreatora Rezerwacji (`/rezerwacja`)**:
   - Przejdź do procesu rezerwacji jako pacjent.
   - Sprawdź krok 1: czy widoczne są 2 kafelki z trafnymi nazwami i cenami (200 zł za online, 220 zł za stacjonarnie).
   - Kliknij "Konsultacja indywidualna – ONLINE" i sprawdź, czy otwiera się kalendarz dla usługi online (`konsultacja-indywidualna`).
   - Wróć przyciskiem "Wstecz", kliknij "Konsultacja indywidualna – STACJONARNIE" i sprawdź, czy otwiera się kalendarz dla usługi stacjonarnej (`konsultacja-indywidualna-stacjonarnie`).
3. **Test Integracji Webhooka i Płatności (Rezerwacja testowa)**:
   - Wybierz termin w usłudze stacjonarnej i zatwierdź rezerwację.
   - Sprawdź, czy kwota przekazywana do transakcji Przelewy24 wynosi 220 zł.
   - W panelu pacjenta sprawdź, czy nowa wizyta ma poprawny tytuł "Konsultacja indywidualna – STACJONARNIE".
   - Kliknij "Przełóż wizytę" w panelu pacjenta i sprawdź, czy otwiera się kalendarz odpowiedniej usługi stacjonarnej.

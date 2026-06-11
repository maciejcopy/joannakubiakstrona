# Plan Implementacji - Backend Supabase & Panele Użytkowników

Niniejszy dokument przedstawia szczegółowy plan wdrożenia systemu rezerwacji, bazy danych Supabase oraz paneli: administracyjnego (dla psychologa) i klienta (dla pacjenta). 

Głównym założeniem jest zachowanie pełnej sprawności obecnej strony głównej (Landing Page) i wdrożenie nowych funkcji na dedykowanych podstronach.

---

## Decyzje projektowe uzgodnione z Użytkownikiem
1. **Nowy projekt Supabase:** Pracujemy na całkowicie nowym, czystym projekcie Supabase. Wszystkie zmienne środowiskowe (`VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`) zostaną zaktualizowane w lokalnym pliku `.env`.
2. **Formularz kontaktowy:** Obecny na stronie formularz kontaktowy (wysyłający maile bezpośrednio przez Resend) zostanie w przyszłości wygaszony i zastąpiony systemem rezerwacji. Na czas prac deweloperskich kod starego formularza pozostaje nienaruszony, aby nie uszkodzić struktury strony live.
3. **Rezerwacje telefoniczne/ręczne:** Psycholog (admin) może ręcznie tworzyć rezerwacje w kalendarzu. System umożliwi rejestrowanie pacjentów "offline" (bez konta internetowego) poprzez utworzenie rekordu w bazie klientów (imię, nazwisko, telefon, dane adresowe) bezpośrednio przez panel admina.
4. **Limit czasowy odwołań:** Na obecnym etapie pacjent może odwołać wizytę w dowolnym momencie. Blokada czasowa (np. do 24h przed) zostanie zaimplementowana w przyszłości.
5. **Powiadomienia e-mail:** Integracja z Resend w nowym projekcie Supabase zostanie skonfigurowana od zera przy użyciu Edge Functions w późniejszym etapie (poza zakresem tego planu).

---

## Podział na KROKI (Krok po Kroku)

### Krok 1: Przygotowanie środowiska, gałęzi Git i nowego Supabase
1. Utworzenie nowej gałęzi w Git: `feature/backend-supabase`.
2. Pobranie danych dostępowych (URL, anon_key) nowego, czystego projektu Supabase.
3. Zaktualizowanie lokalnego pliku `.env` nowymi danymi uwierzytelniającymi.

### Krok 2: Instalacja i konfiguracja Routera oraz Shadcn/ui
1. **Instalacja react-router-dom:**
   Dodanie biblioteki do routingu w projekcie w celu obsługi wielu podstron (np. `/panel`, `/rezerwacja`).
2. **Instalacja i konfiguracja Shadcn/ui:**
   - Zainstalowanie wymaganych zależności (`tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`).
   - Rozszerzenie istniejącego pliku `tailwind.config.js` zamiast jego nadpisywania. Wszystkie dotychczasowe style, czcionki (`Lora`, `Inter`) oraz kolory (`warm-beige`, `dark-green`, `pastel-blue`) zostaną zachowane.
   - Konfiguracja zmiennych CSS w `src/index.css`. Zmienne Shadcn/ui zostaną zdefiniowane wewnątrz dedykowanej klasy-kontenera (np. `.shadcn-theme`), aby ich wpływ był ograniczony wyłącznie do paneli i procesu rezerwacji, pozostawiając Landing Page nienaruszony.

### Krok 3: Projekt Bazy Danych Supabase (Tabele i RLS)
Projekt zakłada dynamiczną architekturę bazy danych PostgreSQL bez twardo kodowanych wartości (enums). Wszystkie typy i statusy będą powiązane z dedykowanymi tabelami słownikowymi z pełną możliwością edycji (CRUD) ze strony admina.

#### Schemat Tabel:

1. **`profiles` (Profile użytkowników)**
   - `id` (uuid, primary key, domyślnie `gen_random_uuid()`)
   - `auth_id` (uuid, unique, references `auth.users(id)`, nullable) -> Nullable pozwala adminowi na tworzenie profilu klienta offline.
   - `email` (text, unique, nullable)
   - `full_name` (text)
   - `phone_prefix` (text) -> np. `+48`
   - `phone_number` (text)
   - `add1` (text) -> Ulica i numer domu/mieszkania
   - `add2` (text, nullable) -> Dodatkowe informacje adresowe
   - `post_code` (text) -> Kod pocztowy
   - `city` (text) -> Miasto
   - `county` (text, nullable) -> Powiat/Województwo
   - `country` (text) -> Kraj
   - `role` (text - wartości: `'user'`, `'client'`, `'admin'`, domyślnie `'user'`)
   - `created_at` (timestamp)
   *Polityka RLS:* Zalogowany użytkownik może czytać i edytować swój profil. Admin ma pełny dostęp do wszystkich profili.

2. **`booking_statuses` (Słownik statusów rezerwacji)**
   - `id` (uuid, primary key)
   - `name` (text, unique) -> np. `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`
   - `label` (text) -> Przyjazna nazwa wyświetlana, np. `'Oczekująca'`, `'Potwierdzona'`
   - `description` (text, nullable)

3. **`payment_statuses` (Słownik statusów płatności)**
   - `id` (uuid, primary key)
   - `name` (text, unique) -> np. `'unpaid'`, `'paid_on_site'`
   - `label` (text) -> Przyjazna nazwa wyświetlana, np. `'Nieopłacona'`, `'Opłacona na miejscu'`
   - `description` (text, nullable)

4. **`location_types` (Słownik lokalizacji)**
   - `id` (uuid, primary key)
   - `name` (text, unique) -> np. `'office'`, `'online'`
   - `label` (text) -> Przyjazna nazwa wyświetlana, np. `'W gabinecie'`, `'Online'`

5. **`visit_types` (Typy sesji/usługi)**
   - `id` (uuid, primary key)
   - `title` (text)
   - `description` (text)
   - `price` (numeric)
   - `duration` (integer - czas trwania w minutach)
   - `is_active` (boolean, domyślnie `true`)
   - `created_at` (timestamp)
   *Polityka RLS:* Wszyscy mogą czytać aktywne typy wizyt. Tylko admin może dodawać/edytować.

6. **`availability` (Reguły dostępności standardowej i wyjątków)**
   - `id` (uuid, primary key)
   - `recurrence_rule` (jsonb) -> Zastępuje sztywne pola dat/godzin. Przechowuje elastyczną konfigurację powtarzalności terminów w formacie RRule lub JSON (np. `{"daysOfWeek": [1,2,3], "startTime": "09:00", "endTime": "15:00", "exceptions": ["2026-07-01"]}`).
   - `created_at` (timestamp)
   *Polityka RLS:* Czytelne dla zalogowanych w celu wyszukiwania terminów. Edytowalne tylko przez admina.

7. **`availability_exceptions` (Urlopy i dni wolne)**
   - `id` (uuid, primary key)
   - `recurrence_rule` (jsonb) -> Elastyczna reguła wykluczeń z kalendarza, np. `{"startDate": "2026-08-01", "endDate": "2026-08-14", "reason": "vacation"}`.
   - `description` (text)
   - `created_at` (timestamp)
   *Polityka RLS:* Czytelne dla wszystkich. Edytowalne tylko przez admina.

8. **`bookings` (Rezerwacje)**
   - `id` (uuid, primary key)
   - `client_id` (uuid, references `profiles.id`)
   - `visit_type_id` (uuid, references `visit_types.id`)
   - `scheduled_at` (timestamp)
   - `status_id` (uuid, references `booking_statuses.id`)
   - `payment_status_id` (uuid, references `payment_statuses.id`)
   - `location_id` (uuid, references `location_types.id`)
   - `is_first_visit` (boolean) -> Flaga oznaczająca, czy dana wizyta jest pierwszą wizytą tego klienta w gabinecie.
   - `cancellation_reason` (text, nullable)
   - `cancelled_at` (timestamp, nullable)
   - `created_at` (timestamp)
   *Polityka RLS:* Użytkownik widzi i edytuje tylko swoje rezerwacje. Admin zarządza wszystkimi.

9. **`app_settings` (Globalne ustawienia konfiguracji aplikacji)**
   - `key` (text, primary key) -> np. `'advance_booking_limit'` (limit rezerwacji z wyprzedzeniem), `'booking_validation_rules'` (warunki rejestracji)
   - `value` (jsonb) -> Wartość parametru, np. `{"limit": 4, "unit": "weeks"}`
   - `description` (text)
   - `updated_at` (timestamp)

10. **`audit_logs` (Dziennik zdarzeń)**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references `profiles.id`, nullable)
    - `action` (text)
    - `details` (jsonb)
    - `created_at` (timestamp)

#### Procedury (Database Functions) i Wyzwalacze (Triggers):
- **`on_auth_user_created`**: Automatyczne tworzenie profilu w tabeli `profiles` po rejestracji w Supabase Auth.
- **`update_role_on_booking`**: Automatyczna zmiana roli z `'user'` na `'client'` w tabeli `profiles` po pomyślnym utworzeniu pierwszej rezerwacji przez użytkownika.
- **`check_is_first_visit`**: Wyzwalacz przed dodaniem nowej rezerwacji (`BEFORE INSERT`). System sprawdza, czy dany `client_id` posiada już inne rezerwacje o statusie potwierdzonym/zrealizowanym. Jeśli nie, automatycznie ustawia `is_first_visit` na `true`.

---

### Krok 4: Projekt Ścieżek i Routingu (Routing)
Struktura podstron w React Router z wykorzystaniem dedykowanych widoków szczegółów zamiast okien modalnych:

- `/` – Landing Page (Nienaruszona strona główna, stary kod formularza kontaktowego zostaje w celach wstecznej kompatybilności, dodany przycisk logowania i rezerwacji).
- `/auth` – Logowanie i rejestracja:
  - `/auth/login` – Logowanie.
  - `/auth/register` – Rejestracja.
- `/rezerwacja` – Kreator rezerwacji.
- `/panel` – Widoki chronione (Auth Guards):
  - `/panel/pacjent` – Panel Klienta:
    - `/panel/pacjent/dashboard` – Lista wizyt, historia, odwołania.
    - `/panel/pacjent/profil` – Edycja profilu (imię, nazwisko, telefon z prefiksem, adres).
  - `/panel/admin` – Panel Administracyjny (wymaga roli `'admin'`):
    - `/panel/admin/dashboard` – Statystyki.
    - `/panel/admin/kalendarz` – Kalendarz rezerwacji.
    - `/panel/admin/bookings/:id` – Szczegółowy widok pojedynczej rezerwacji z historią zmian i edycją.
    - `/panel/admin/clients/:id` – Szczegółowy profil klienta ze statystykami i listą jego wizyt.
    - `/panel/admin/sesje` – CRUD typów sesji.
    - `/panel/admin/klienci` – Lista klientów gabinetu.
    - `/panel/admin/ustawienia` – Reguły dostępności (`recurrence_rule`) oraz konfiguracja `app_settings` (w tym Advance Booking Limit).

---

### Krok 5: UI/UX i Dostosowanie Wizualne (Branding Guide)
- **Stylizacja paneli:** Spójna z dotychczasowym Landing Page (wykorzystanie kolorów `#F6FAF4` jako tła roboczego, `#2F5C3A` dla nagłówków/przycisków głównych oraz `#48A7C9` jako akcentu akcji).
- **Powiadomienia Toast:** Zostaną przeniesione i wyświetlane w **prawym górnym rogu ekranu** (`top-right`), zgodnie z nowym zaleceniem.

---

### Krok 6: Przygotowanie integracji z e-mail (Przyszły etap)
W tym planie **nie wdrażamy** integracji z Resend. Kod i konfiguracja powiadomień mailowych (Edge Functions) zostaną przygotowane i uruchomione od zera na nowym projekcie Supabase w osobnym etapie prac.

---

## Plan Weryfikacji (Verification Plan)

### Testy Automatyczne
- Weryfikacja triggera ustawiającego flagę `is_first_visit` na `true` przy pierwszej rezerwacji oraz na `false` przy kolejnych.

### Weryfikacja Manualna
- Sprawdzenie poprawności połączenia z nowym projektem Supabase na nowych kluczach API.
- Sprawdzenie poprawności zapisu elastycznych reguł dostępności (`recurrence_rule`) i poprawności ich parsowania w kalendarzu.
- Test wczytywania i walidacji rezerwacji na podstawie ograniczeń z tabeli `app_settings` (np. próba rezerwacji poza dopuszczalnym okresem wyprzedzenia).
- Sprawdzenie routingu i bezpośrednich linków do `/panel/admin/bookings/:id` oraz `/panel/admin/clients/:id`.

---

## Zbiorcza Checklista Wdrożenia

### Krok 1: Przygotowanie środowiska, gałęzi Git i nowego Supabase
- [ ] Krok 1.1: Utworzenie nowej gałęzi Git `feature/backend-supabase`
- [ ] Krok 1.2: Pobranie nowych kluczy (URL i anon_key) z nowego czystego projektu Supabase
- [ ] Krok 1.3: Aktualizacja konfiguracji lokalnej i pliku `.env` nowymi wartościami

### Krok 2: Instalacja i konfiguracja Routera oraz Shadcn/ui
- [ ] Krok 2.1: Instalacja `react-router-dom`
- [ ] Krok 2.2: Instalacja zależności Shadcn/ui (`tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`)
- [ ] Krok 2.3: Konfiguracja `tailwind.config.js` (rozszerzenie bez nadpisywania obecnych stylów Landing Page)
- [ ] Krok 2.4: Dodanie zmiennych CSS Shadcn do `src/index.css` wewnątrz klasy `.shadcn-theme`

### Krok 3: Projekt Bazy Danych Supabase (Tabele i RLS w nowym projekcie)
- [ ] Krok 3.1: Utworzenie tabeli `profiles` (z polami adresowymi, prefixem i numerem telefonu)
- [ ] Krok 3.2: Utworzenie tabeli `booking_statuses` (słownik statusów)
- [ ] Krok 3.3: Utworzenie tabeli `payment_statuses` (słownik płatności)
- [ ] Krok 3.4: Utworzenie tabeli `location_types` (słownik lokalizacji)
- [ ] Krok 3.5: Utworzenie tabeli `visit_types` (typy wizyt)
- [ ] Krok 3.6: Utworzenie tabeli `availability` (`recurrence_rule` jako JSONB)
- [ ] Krok 3.7: Utworzenie tabeli `availability_exceptions` (`recurrence_rule` jako JSONB)
- [ ] Krok 3.8: Utworzenie tabeli `bookings` (z powiązaniami słownikowymi i flagą `is_first_visit`)
- [ ] Krok 3.9: Utworzenie tabeli `app_settings` (konfiguracja globalna)
- [ ] Krok 3.10: Utworzenie tabeli `audit_logs` (dziennik zdarzeń)
- [ ] Krok 3.11: Konfiguracja RLS (Row Level Security) dla wszystkich tabel w nowym projekcie
- [ ] Krok 3.12: Wdrożenie wyzwalacza `on_auth_user_created`
- [ ] Krok 3.13: Wdrożenie wyzwalacza `update_role_on_booking`
- [ ] Krok 3.14: Wdrożenie wyzwalacza `check_is_first_visit`

### Krok 4: Projekt Ścieżek i Routingu (Routing)
- [ ] Krok 4.1: Konfiguracja głównego routera w `src/App.tsx` (stary kod formularza kontaktowego pozostaje nienaruszony)
- [ ] Krok 4.2: Stworzenie widoków logowania `/auth/login` i rejestracji `/auth/register`
- [ ] Krok 4.3: Stworzenie kreatora rezerwacji `/rezerwacja` (usługi -> terminy -> podsumowanie)
- [ ] Krok 4.4: Stworzenie panelu pacjenta `/panel/pacjent/dashboard` i profilu `/panel/pacjent/profil`
- [ ] Krok 4.5: Stworzenie panelu admina `/panel/admin/dashboard` i `/panel/admin/kalendarz`
- [ ] Krok 4.6: Stworzenie podstrony szczegółów rezerwacji `/panel/admin/bookings/:id`
- [ ] Krok 4.7: Stworzenie podstrony profilu klienta `/panel/admin/clients/:id`
- [ ] Krok 4.8: Stworzenie podstron CRUD sesji `/panel/admin/sesje`, listy klientów `/panel/admin/klienci` i ustawień `/panel/admin/ustawienia`
- [ ] Krok 4.9: Implementacja mechanizmu zabezpieczania ścieżek (Auth Guards dla ról pacjent/admin)

### Krok 5: UI/UX i Dostosowanie Wizualne (Branding Guide)
- [ ] Krok 5.1: Zastosowanie kolorystyki spójnej z Landing Page w nowych panelach
- [ ] Krok 5.2: Konfiguracja i integracja Toast w pozycji `top-right`
- [ ] Krok 5.3: Implementacja okien dialogowych `Dialog` dla potwierdzeń (anulowania wizyt itp.)

### Krok 6: Weryfikacja i Testy (Nowy Projekt Supabase)
- [ ] Krok 6.1: Sprawdzenie poprawności połączenia z nowym projektem na nowych kluczach
- [ ] Krok 6.2: Testy automatyczne triggera `is_first_visit` oraz procedury usuwania konta
- [ ] Krok 6.3: Manualny test procesu rezerwacji pacjenta online i weryfikacja bazy danych
- [ ] Krok 6.4: Manualny test dodawania rezerwacji offline przez panel administratora
- [ ] Krok 6.5: Weryfikacja poprawności ograniczeń czasowych na bazie `app_settings`
- [ ] Krok 6.6: Weryfikacja wizualna spójności Landing Page po wdrożeniu Shadcn/ui

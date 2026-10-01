# Plan Implementacji: Przełączenie Przelewy24 na Tryb Produkcyjny

**Cel**: Bezpieczne przełączenie integracji Przelewy24 z sandboxa (`sandbox.przelewy24.pl`) na produkcję (`secure.przelewy24.pl`) w Supabase Edge Functions (`p24-create-transaction` oraz `p24-webhook`).

---

### Krok 1: Sprawdzenie i weryfikacja obecnych nazw sekretów Supabase Edge Functions (ZREALIZOWANE)
- Odczytanie kodu funkcji `p24-create-transaction` oraz `p24-webhook` w celu wypisania dokładnych nazw zmiennych środowiskowych / sekretów (`Deno.env.get(...)`), które przechowują Merchant ID, CRC oraz API key.
- Przedstawienie użytkownikowi dokładnych nazw sekretów do uzupełnienia wartościami produkcyjnymi.

### Krok 2: Podmiana sekretów Supabase na wartości produkcyjne (ZREALIZOWANE)
- Ustawienie i aktualizacja sekretów w Supabase z wartościami produkcyjnymi dla `P24_MERCHANT_ID`, `P24_CRC_KEY`, `P24_REPORT_KEY`.

### Krok 3: Zmiana adresu URL Przelewy24 z Sandbox na Produkcję w Edge Functions (ZREALIZOWANE)
- Zamiana hardkodowanego adresu `https://sandbox.przelewy24.pl` na `https://secure.przelewy24.pl` w kodzie funkcji `p24-create-transaction` i `p24-webhook`.
- Zapewnienie elastyczności konfiguracji przy użyciu zmiennej `P24_API_BASE` oraz dynamicznego budowania adresu przekierowania transakcji `trnRequest`.

### Krok 4: Weryfikacja spójności logiki biznesowej (ZREALIZOWANE)
- Przeprowadzono weryfikację `git diff` oraz całego przepływu obu funkcji:
  - Mechanizm retry przy pobieraniu rezerwacji (`findBookingWithRetry`) pozostał w 100% nienaruszony.
  - Wyliczanie podpisu SHA-384 (`sha384Hex`) i weryfikacja webhooka (`expectedSign === sign` oraz weryfikacja `/transaction/verify`) pozostały bez zmian.
  - Rozpakowywanie `sessionId` (np. obsługa formatu `{bookingId}__{timestamp}`) i aktualizacja `payment_status_id` na `19b434c2-935f-4328-987e-b34cf489ed22` (`PAID_ONLINE_STATUS_ID`) pozostały bez zmian.
  - Jedyną wprowadzoną zmianą jest podmiana URL API na `secure.przelewy24.pl` oraz dynamiczne wyliczanie hosta przekierowania.

### Krok 5: Wdrożenie zaktualizowanych Edge Functions do Supabase (ZREALIZOWANE)
- Pomyślnie wdrożono zaktualizowany kod obu funkcji (`p24-create-transaction` w wersji 8 z `verify_jwt: true` oraz `p24-webhook` w wersji 6 z `verify_jwt: false`) na środowisko Supabase za pośrednictwem oficjalnego Supabase API.

### Krok 6: Testy produkcyjne płatności P24 (ZREALIZOWANE)
- Zweryfikowano działanie na środowisku produkcyjnym:
  - Funkcja `p24-create-transaction` pomyślnie komunikuje się z `https://secure.przelewy24.pl/api/v1/transaction/register`.
  - Rejestracja sesji, podpis CRC SHA-384 oraz generowanie tokenu transakcji zostały zweryfikowane i zaakceptowane przez Przelewy24.
  - Przekierowanie klienta na produkcyjną stronę płatności (`secure.przelewy24.pl/trnRequest/...`) działa prawidłowo.

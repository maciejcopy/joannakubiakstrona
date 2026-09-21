# Plan restrukturyzacji strony głównej pod kątem konwersji (rezerwacji)

Ten plan opisuje kroki potrzebne do przebudowania przepływu użytkownika na stronie głównej w celu maksymalizacji liczby rezerwacji wizyt przez `/rezerwacja`, oraz przeniesienia formularza kontaktowego na dedykowaną podstronę `/kontakt`.

## Krok 1: Dodanie nowej podstrony kontaktu
- Utworzenie pliku `src/pages/ContactPage.tsx`.
- Przeniesienie tam dotychczasowej logiki i kodu formularza kontaktowego z `src/components/Contact.tsx`.
- Dodanie ładnego układu z danymi adresowymi, godzinami kontaktu i mapkami.

## Krok 2: Konfiguracja Routingu
- Dodanie nowej ścieżki `/kontakt` w `src/App.tsx`.

## Krok 3: Aktualizacja Header i nawigacji
- Modyfikacja `src/components/Header.tsx`, aby link „Kontakt” kierował na `/kontakt` (za pomocą React Router `<Link>`).
- Usprawnienie zachowania mobilnego menu.

## Krok 4: Modyfikacja sekcji Hero
- Modyfikacja `src/components/HeroSection.tsx`, aby przycisk „UMÓW KONSULTACJĘ” kierował bezpośrednio na `/rezerwacja` (lub w przyszłości bezpośrednio na widget cal.com).

## Krok 5: Odchudzenie sekcji na stronie głównej
- Modyfikacja `src/components/Contact.tsx` (sekcja na stronie głównej) — usunięcie formularza, zmiana nazwy/celu sekcji na przejrzysty Cennik i Lokalizacje, oraz dodanie widocznego wezwania do działania (CTA) kierującego do rezerwacji.

---
*Przygotowane przez Antigravity na podstawie ustaleń z użytkownikiem.*

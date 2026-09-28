# Plan Implementacji: Optymalizacja SEO, AEO i GEO

**Projekt:** mgr Joanna Kubiak - Gabinet Psychologiczny  
**Zgłoszenie GitHub:** [Issue #24](https://github.com/maciejcopy/joannakubiakstrona/issues/24)  
**Gałąź Git:** `feature/supabase-backend-logic`  
**Data utworzenia:** 2026-09-28  
**Status:** Przygotowany do realizacji (nieuruchomiony)

---

## 🎯 Cele i Założenia

1. **SEO (Search Engine Optimization):**
   * Precyzyjne indeksowanie publicznych tras przez Google i Bing.
   * Eliminacja niespójności geolokalizacyjnych (poprawa z historycznego „Warszawa” na realną lokalizację: **Swarzędz / Poznań / Gruszczyn + wizyty Online**).
   * Unikalne tytuły (`<title>`), opisy (`description`), tagi kanoniczne (`canonical`) oraz Open Graph / Twitter Cards dla każdej podstrony.

2. **AEO (Answer Engine Optimization):**
   * Struktura treści przygotowana pod wyszukiwanie głosowe i silniki odpowiedzi (Google Featured Snippets).
   * Format bezpośrednich pytań i zwięzłych, merytorycznych odpowiedzi (sekcja FAQ z mikrodanymi `FAQPage`).

3. **GEO (Generative Engine Optimization dla AI):**
   * Maksymalna zrozumiałość profilu i oferty dla modeli generatywnych (ChatGPT Search, Perplexity, Claude, Gemini).
   * Sygnatury **E-E-A-T** (doświadczenie, wykształcenie, specjalizacje, certyfikaty mgr Joanny Kubiak).
   * Bogate dane strukturalne JSON-LD (`MedicalBusiness` / `Psychologist`, `Person`, `BreadcrumbList`).

4. **Rozwiązanie kwestii SPA (Połączenie Opcji A i Opcji C):**
   * **Opcja A:** Dynamiczne zarządzanie `<head>` w kodzie React + bogaty statyczny szablon w `index.html`.
   * **Opcja C:** Włączenie **Netlify Prerendering**, dzięki czemu serwer automatycznie serwuje pełny wyrenderowany HTML crawlerom botów (w tym social media i AI).

---

## 📋 Zakres publicznych podstron do indeksacji

| Ścieżka URL | Nazwa widoku | Tytuł SEO | Schema.org |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | mgr Joanna Kubiak – Psycholog dzieci i młodzieży \| Swarzędz & Online | `Psychologist`, `LocalBusiness`, `FAQPage` |
| `/kontakt` | `ContactPage.tsx` | Kontakt i Gabinety – mgr Joanna Kubiak \| Swarzędz | `LocalBusiness`, `ContactPage`, `BreadcrumbList` |
| `/rezerwacja` | `BookingWizard.tsx` | Rezerwacja wizyty – Konsultacja psychologiczna \| mgr Joanna Kubiak | `BreadcrumbList` |
| `/regulamin` | `RegulaminPage.tsx` | Regulamin świadczenia usług – mgr Joanna Kubiak | `BreadcrumbList` |
| `/polityka-prywatnosci` | `PolitykaPrywatnosciPage.tsx` | Polityka prywatności i RODO – mgr Joanna Kubiak | `BreadcrumbList` |

*Uwaga: Trasy `/panel/*`, `/auth/*`, `/profil` oraz `/unauthorized` są prywatne i zostaną zablokowane przed indeksacją.*

---

## 🚀 Fazy Wdrożenia Krok po Kroku

### Faza 1: Fundament SEO w React (Opcja A) — ✅ UKOŃCZONE
Cel: Zapewnienie komponentu zarządzającego `<head>` oraz wstrzykiwaniem znaczników meta i schematów JSON-LD bez konieczności przeładowywania strony.

1. **Utworzenie uniwersalnego komponentu SEO:**
   * Ścieżka: `src/components/SEO.tsx` ✅
   * Funkcjonalności:
     * Dynamiczna aktualizacja `document.title`
     * Dynamiczne zarządzanie tagami: `meta[name="description"]`, `meta[name="keywords"]`, `link[rel="canonical"]`
     * Obsługa Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`)
     * Obsługa Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
     * Wstrzykiwanie skryptu `application/ld+json` z automatycznym czyszczeniem przy odmontowaniu
2. **Aktualizacja bazowego `index.html`:**
   * Skorygowanie domyślnych metadanych z błędnej lokalizacji „Warszawa” na poprawną („Swarzędz, Poznań, Online”) ✅
   * Dodanie podstawowych tagów Open Graph i Twitter Cards jako fallback dla środowisk bez obsługi skryptów ✅

---

### Faza 2: Optymalizacja On-page pod AEO & GEO (Treść, FAQ i E-E-A-T) — ✅ UKOŃCZONE
Cel: Sformatowanie pytań i odpowiedzi pod kątem bezpośredniej syntezy przez asystentów AI i wyszukiwarki.

1. **Przygotowanie modułu pytań i odpowiedzi (FAQ):**
   * Utworzono bazę pytań i odpowiedzi `src/config/faqData.ts` (8 pytań z bezpośrednimi odpowiedziami AEO i wyczerpującymi wyjaśnieniami) ✅
   * Utworzono nowoczesny, interaktywny i dostępny komponent `src/components/FAQ.tsx` z wyróżnieniem „W skrócie” (AEO) ✅
   * Wdrożono sekcję FAQ na stronie głównej `src/pages/LandingPage.tsx` ✅
   * Zaktualizowano sekcję pytań na stronie kontaktu `src/pages/ContactPage.tsx` z aktualnym cennikiem (220 zł stacjonarnie, 200 zł online) ✅
2. **Wzmocnienie sygnałów E-E-A-T w sekcji „O mnie” (`About.tsx`):**
   * Wyeksponowano kafelki kwalifikacji: wykształcenie magisterskie (Uczelnia Varsovia), certyfikowane szkolenia (DBT, diagnoza zaburzeń osobowości), standardy etyczne i poufność ✅

---

### Faza 3: Implementacja metadanych i JSON-LD per-podstrona — ✅ UKOŃCZONE
Cel: Opatrzenie każdej publicznej podstrony odpowiednim zestawem danych strukturalnych.

1. **Strona główna (`/` – `LandingPage.tsx`):** ✅
   * Komponent `SEO` z dedykowanym tytułem, opisem i linkiem kanonicznym.
   * Schemat `MedicalBusiness` / `LocalBusiness`:
     * Nazwa firmy: `"Open Mind" Joanna Kubiak`
     * Osoba: `mgr Joanna Kubiak`
     * Adres: Przychodnia Multi-Medic, ul. Cieszkowskiego 100/102, Swarzędz, współrzędne geo
     * Usługi: Konsultacja indywidualna stacjonarna (220 zł), Konsultacja online (200 zł)
     * Telefon: `+48 602 105 795`, E-mail: `joannakubiakpsycholog@gmail.com`
   * Schemat `Person` z wykształceniem, kwalifikacjami i specjalizacjami.
   * Schemat `FAQPage` ze wszystkimi pytaniami i odpowiedziami AEO.
2. **Strona kontaktu (`/kontakt` – `ContactPage.tsx`):** ✅
   * Schemat `ContactPage` oraz `LocalBusiness` z danymi teleadresowymi.
   * BreadcrumbList: `Strona główna > Kontakt`.
3. **Strona rezerwacji (`/rezerwacja` – `BookingWizard.tsx`):** ✅
   * Zoptymalizowany title, opis i słowa kluczowe.
   * BreadcrumbList: `Strona główna > Rezerwacja wizyty`.
4. **Podstrony prawne (`/regulamin`, `/polityka-prywatnosci`):** ✅
   * Dedykowane metadane i BreadcrumbList dla obu dokumentów prawnych.

---

### Faza 4: Pliki indeksowania (`sitemap.xml` i `robots.txt`) — ✅ UKOŃCZONE
Cel: Precyzyjna komunikacja z robotami wyszukiwarek i agentami AI.

1. **Utworzenie `public/sitemap.xml`:** ✅
   * Zawiera wyłącznie publiczne adresy kanoniczne z domeną joannakubiakpsycholog.pl (priorytety 1.0, 0.9, 0.8, 0.3).
2. **Utworzenie `public/robots.txt`:** ✅
   * Dozwolone roboty: Standardowe wyszukiwarki (`User-agent: *`) oraz boty AI (`GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`).
   * Zablokowane katalogi aplikacji prywatnej: `/panel/`, `/auth/`, `/profil`, `/unauthorized`.
   * Wskazanie sitemapy: `Sitemap: https://joannakubiakpsycholog.pl/sitemap.xml`.

---

### Faza 5: Serwerowa obsługa SPA na Netlify (Opcja C) & Finalizacja — 🚀 GOTOWE DO AKTYWACJI
Cel: Pełne wsparcie dla botów nieobsługujących JavaScriptu i weryfikacja techniczna.

1. **Konfiguracja Netlify Prerendering:**
   * W panelu Netlify: *Site configuration -> Build & deploy -> Prerendering* -> Włącz Prerendering (szczegółowy przewodnik poniżej).
2. **Kompilacja i testy kodu:** ✅
   * Weryfikacja statyczna TypeScript: `npx tsc --noEmit` (0 błędów).
   * Weryfikacja produkcyjnego bundle: `npm run build` (zakończona sukcesem).
3. **Walidacja danych strukturalnych:** ✅
   * Dane JSON-LD wygenerowane zgodnie ze standardami Schema.org dla `MedicalBusiness`, `Person`, `FAQPage`, `ContactPage`, `BreadcrumbList`.
4. **Zaktualizowanie zgłoszenia GitHub (#24):** ✅
   * Oznaczenie wszystkich kryteriów akceptacji jako spełnionych.

---

## 🔍 Matryca Weryfikacji (Checklist)

- [x] `SEO.tsx` działa bez błędów konsoli i podmienia `<title>` oraz tagi meta przy nawigacji po podstronach.
- [x] Usunięto odniesienia do Warszawy w `index.html` na rzecz Swarzędza i wizyt online.
- [x] JSON-LD generuje poprawny schemat `Psychologist` i `FAQPage` bez błędów składniowych.
- [x] Plik `public/sitemap.xml` jest dostępny bezpośrednio pod adresem `/sitemap.xml`.
- [x] Plik `public/robots.txt` blokuje `/panel/*` i zawiera link do sitemapy.
- [x] Prerendering na Netlify: przygotowano instrukcję włączenia w panelu Netlify.
- [x] Projekt buduje się bez żadnych błędów (`npm run build`).

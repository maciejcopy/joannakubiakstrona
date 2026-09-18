# Plan Implementacji: Infrastruktura Prawna (Puste kontenery, Routing, Stopka, Kreator Rezerwacji dla Przelewy24)

## 1. Cel i Kontekst
Przygotowanie wyłącznie technicznej i wizualnej **infrastruktury** pod regulamin i politykę prywatności, zgodnie z wymogami serwisu Przelewy24 (PayPro S.A.). 
**Ważne założenie:** Agent **nie generuje żadnej treści prawnej** (ani regulaminu, ani polityki prywatności). Przygotowywane są wyłącznie komponenty bazowe, routing, nawigacja oraz wydzielone, puste sloty/kontenery z placeholderem komentarza, w które użytkownik wklei własne, gotowe treści.

---

## 2. Zakres prac

### Krok 1: Centralny plik konfiguracyjny danych firmy (`companyInfo.ts`)
- **Nowy plik:** `src/config/companyInfo.ts`
- **Zawartość:** Puste wartości/placeholdery stałych:
  - `companyName`: `"[TUTAJ_NAZWA_FIRMY]"`
  - `ownerName`: `"mgr Joanna Kubiak"`
  - `nip`: `"[TUTAJ_NIP]"`
  - `regon`: `"[TUTAJ_REGON]"`
  - `address`: `{ street: "[TUTAJ_ULICA]", postalCode: "[TUTAJ_KOD]", city: "[TUTAJ_MIASTO]" }`
  - `email`: `"kontakt@joannakubiakpsycholog.pl"`
  - `phone`: `"+48 729 933 833"`
- **Cel:** Gdy użytkownik poda dane firmy, zostaną one wpisane w tym jednym pliku i zasilą całą stronę (stopka, kontakt, nagłówki).

### Krok 2: Komponent bazowy oprawy dokumentu (`LegalLayout.tsx`)
- **Nowy plik:** `src/components/legal/LegalLayout.tsx`
- **Zadanie:** Wizualna powłoka dla dokumentów prawnych:
  - Estetyczny nagłówek z tytułem dokumentu (font szeryfowy, styl gabinetu).
  - Pasek informacyjny: Data wejścia w życie / aktualizacji dokumentu (`[TUTAJ_DATA]`).
  - Przycisk szybkiego powrotu do strony głównej lub poprzedniej strony.
  - Zdefiniowany kontener o optymalnej szerokości (`max-w-4xl`) z przygotowanymi stylami typografii pod wklejenie tekstu.
  - Slot (`children`) na wklejenie treści dokumentu.

### Krok 3: Pusta podstrona Regulaminu (`RegulaminPage.tsx`)
- **Nowy plik:** `src/pages/legal/RegulaminPage.tsx`
- **Dostępna pod adresem:** `/regulamin`
- **Zawartość:**
  - Używa `LegalLayout`.
  - Tytuł: *"Regulamin świadczenia usług i rezerwacji wizyt"*.
  - **Brak wygenerowanych punktów/paragrafów.** Wyłącznie czysty kontener z czytelnym komentarzem w kodzie:
    ```tsx
    {/* ========================================================================= */}
    {/* TUTAJ ZOSTANIE WKLEJONA CAŁA TREŚĆ REGULAMINU DOSTARCZONA PRZEZ UŻYTKOWNIKA */}
    {/* ========================================================================= */}
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
      Treść regulaminu jest w trakcie przygotowania i zostanie wkrótce opublikowana.
    </div>
    ```

### Krok 4: Pusta podstrona Polityki Prywatności (`PolitykaPrywatnosciPage.tsx`)
- **Nowy plik:** `src/pages/legal/PolitykaPrywatnosciPage.tsx`
- **Dostępna pod adresem:** `/polityka-prywatnosci`
- **Zawartość:**
  - Używa `LegalLayout`.
  - Tytuł: *"Polityka Prywatności i Plików Cookies"*.
  - **Brak wygenerowanych punktów/paragrafów.** Wyłącznie czysty kontener z czytelnym komentarzem w kodzie:
    ```tsx
    {/* ================================================================================= */}
    {/* TUTAJ ZOSTANIE WKLEJONA CAŁA TREŚĆ POLITYKI PRYWATNOŚCI DOSTARCZONA PRZEZ UŻYTKOWNIKA */}
    {/* ================================================================================= */}
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
      Treść polityki prywatności jest w trakcie przygotowania i zostanie wkrótce opublikowana.
    </div>
    ``

### Krok 5: Rejestracja ścieżek w routerze (`App.tsx`)
- Dodanie publicznych tras:
  ```tsx
  <Route path="/regulamin" element={<RegulaminPage />} />
  <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosciPage />} />
  ```

### Krok 6: Rozbudowa stopki (`Footer.tsx`)
- Dodanie sekcji danych rejestrowych firmy czerpiącej z `companyInfo.ts` (`NIP: ...`, `REGON: ...`).
- Dodanie klikalnych linków nawigacyjnych do `/regulamin` oraz `/polityka-prywatnosci` w dolnym pasku stopki.

### Krok 7: Klauzula w Kreatorze Rezerwacji (`BookingWizard.tsx`) – Opcja A
- W Kroku 2 (pod wyborem terminu i informacją o płatnościach):
  - Dodanie estetycznej notki z linkami otwierającymi się w nowej karcie (`target="_blank"`):
    > *"Dokonując rezerwacji, akceptujesz nasz [Regulamin](/regulamin) oraz [Politykę Prywatności](/polityka-prywatnosci). Płatności online obsługuje serwis Przelewy24 (PayPro S.A.)."*

### Krok 8: Aktualizacja podstrony kontaktu (`ContactPage.tsx`)
- Dodanie bloku informacyjnego z danymi firmy (NIP, REGON, dane adresowe) pobieranymi z `companyInfo.ts`.

---

## 3. Plan Weryfikacji
- [ ] Strona `/regulamin` otwiera się pod poprawnym adresem, z oprawą graficzną i miejscem na wklejenie tekstu.
- [ ] Strona `/polityka-prywatnosci` otwiera się pod poprawnym adresem, z oprawą graficzną i miejscem na wklejenie tekstu.
- [ ] Linki w stopce (`Footer.tsx`) przenoszą na odpowiednie podstrony prawne.
- [ ] Sekcja danych rejestrowych w stopce i na stronie kontaktu wyświetla placeholdery z `companyInfo.ts`.
- [ ] W kreatorze `BookingWizard.tsx` widoczna jest notka z linkami otwierającymi regulamin i politykę w nowej karcie.
- [ ] Sprawdzenie poprawności typowania TypeScript (`npx tsc --noEmit`).

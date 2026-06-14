# Plan Implementacji – Ulepszenia UI/UX Paneli

> **Cel:** Modernizacja wyglądu i intuicyjności panelu admina oraz dashboardu pacjenta.  
> **Zasada:** Żadna istniejąca funkcja nie zostaje usunięta – wyłącznie ulepszenia wizualne i UX-owe.  
> **Stack:** React + TypeScript + TailwindCSS + Lucide React (już w zależnościach)

---

## Pliki objęte zmianami

| Plik | Rola | Typ zmiany |
|------|------|------------|
| `src/config/sidebarConfig.ts` | **[NOWY]** Centralna konfiguracja menu | Tworzenie |
| `src/components/PanelLayout.tsx` | Layout z sidebariem | Modyfikacja |
| `src/pages/panel/admin/AdminDashboard.tsx` | Główny dashboard admina | Modyfikacja |
| `src/pages/panel/admin/AdminKlienci.tsx` | Lista klientów | Modyfikacja |
| `src/pages/panel/admin/AdminSesje.tsx` | Typy sesji | Modyfikacja |
| `src/pages/panel/admin/AdminBookingDetails.tsx` | Szczegóły rezerwacji | Modyfikacja |
| `src/pages/panel/admin/AdminClientDetails.tsx` | Szczegóły klienta | Modyfikacja |
| `src/pages/panel/admin/AdminUstawienia.tsx` | Ustawienia | Modyfikacja |
| `src/pages/panel/pacjent/PacjentDashboard.tsx` | Dashboard pacjenta | Modyfikacja |
| `src/pages/panel/pacjent/PacjentProfil.tsx` | Profil pacjenta | Modyfikacja |

---

## KROK 1 – Refaktoryzacja: Centralna konfiguracja sidebarów

> **Priorytet: Krytyczny** – ten krok odblokuje resztę zmian.  
> Aktualnie `sidebarItems` jest dosłownie zduplikowane w każdym pliku strony (6+ kopii).

### [NOWY] `src/config/sidebarConfig.tsx`

Stworzyć plik eksportujący dwie stałe tablice:

```typescript
import {
  LayoutDashboard,
  Calendar,
  Users,
  Layers,
  Settings,
  User,
} from 'lucide-react';

export const adminSidebarItems = [
  { label: 'Dashboard',     path: '/panel/admin/dashboard',   icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Kalendarz',     path: '/panel/admin/kalendarz',   icon: <Calendar className="h-5 w-5" /> },
  { label: 'Klienci',       path: '/panel/admin/klienci',     icon: <Users className="h-5 w-5" /> },
  { label: 'Typy Sesji',    path: '/panel/admin/sesje',       icon: <Layers className="h-5 w-5" /> },
  { label: 'Ustawienia',    path: '/panel/admin/ustawienia',  icon: <Settings className="h-5 w-5" /> },
  { label: 'Mój Profil',    path: '/profil',                  icon: <User className="h-5 w-5" /> },
];

export const pacjentSidebarItems = [
  { label: 'Moje Wizyty',   path: '/panel/pacjent/dashboard', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Mój Profil',    path: '/panel/pacjent/profil',    icon: <User className="h-5 w-5" /> },
];
```

### Modyfikacja wszystkich stron panelu

Każda strona panelu admina i pacjenta:
- **Usuwa** lokalnie zdefiniowaną tablicę `sidebarItems`
- **Importuje** odpowiednią stałą z `../../../config/sidebarConfig`
- Przekazuje ją do `<PanelLayout sidebarItems={adminSidebarItems} ...>`

**Dotyczy plików:** wszystkie 8 stron panelu.

---

## KROK 2 – PanelLayout: Sidebar i header

> **Plik:** `src/components/PanelLayout.tsx`  
> **Zachowane funkcje:** collapse na desktop, mobilny drawer, avatar użytkownika, wylogowanie

### 2.1 Styl aktywnego linku w sidebarze

**Obecny styl aktywny:**
```
bg-[#2F5C3A] text-white shadow-soft
```

**Nowy styl aktywny** – lewa kreska + delikatne tło:
```
border-l-4 border-[#48A7C9] bg-[#2F5C3A]/10 text-[#2F5C3A] font-semibold
```

**Nowy hover (nieaktywne):**
```
hover:bg-[#2F5C3A]/8 hover:text-[#2F5C3A]
```
(zamiast obecnego ledwo widocznego `hover:bg-[#F6FAF4]/50`)

### 2.2 Tło sidebara

Zmiana tła sidebara z białego (`bg-white`) na bardzo delikatnie zielone:
```
bg-[#F8FBF7]
```
Dzięki temu sidebar oddziela się od białej treści bez ciężkiej granicy.

### 2.3 Header głównej treści

**Obecny:** tytuł strony + data po prawej (mała, szara)

**Nowy:**
- Tytuł strony (bez zmian)
- Pod tytułem: opcjonalny `subtitle` prop (krótki opis strony) – `<p className="text-sm text-gray-400 mt-0.5">`
- Data przeniesiona do **stopki sidebara** (między avatarem użytkownika a przyciskiem wylogowania)
- Dodanie `subtitle?: string` do interfejsu `PanelLayoutProps`

### 2.4 Ikona wylogowania z Lucide

Zastąpić ręczne SVG przycisku wylogowania:
```typescript
import { LogOut } from 'lucide-react';
// ...
<LogOut className="h-4 w-4 flex-shrink-0" />
```

### 2.5 Animacja wejścia treści

Opakować `{children}` w `<div className="animate-fade-in">` – keyframe już istnieje w `tailwind.config.js`.

---

## KROK 3 – AdminDashboard: Wzbogacenie kart statystyk

> **Plik:** `src/pages/panel/admin/AdminDashboard.tsx`  
> **Zachowane funkcje:** tooltips na hover, dane ze Supabase (totalBookings, confirmedBookings, totalClients)

### 3.1 Nowy wygląd kart statystyk

Każda z 3 kart otrzymuje:
- Ikonę z Lucide (duże `h-10 w-10`, `opacity-15`, w prawym górnym rogu)
- Delikatny gradient tła zamiast jednokolorowego
- Kolorowy akcent (lewy border lub górny border)
- Zachowany tooltip na hover (bez zmian)

**Karta "Liczba rezerwacji":**
```
bg-gradient-to-br from-blue-50 to-white
border-l-4 border-blue-300
Ikona: <CalendarDays /> (niebieska, opacity-20)
```

**Karta "Potwierdzone wizyty":**
```
bg-gradient-to-br from-emerald-50 to-white
border-l-4 border-emerald-300
Ikona: <CheckCircle /> (zielona, opacity-20)
```

**Karta "Aktywni Klienci":**
```
bg-gradient-to-br from-purple-50 to-white
border-l-4 border-purple-300
Ikona: <Users /> (fioletowa, opacity-20)
```

Liczba pozostaje dużą cyfrą `text-3xl font-serif font-bold` – bez zmian.

### 3.2 Tabela "Ostatnie rezerwacje" – ulepszenia

Zachowana w całości (nawigacja, statusy, badge "1sza wizyta"). Zmiany wizualne:
- Wrapper tabeli: `overflow-hidden rounded-2xl` (zamiast osobnego `rounded-3xl` na karcie)
- Nagłówek `<thead>`: `bg-[#2F5C3A]/5`, tekst `text-[#2F5C3A]`
- Row hover: `hover:bg-[#F0F7EE]`
- Pierwsze TD w każdym wierszu: dodać **inicjał klienta** w małym kółku (`h-7 w-7 rounded-full bg-[#C4DEBE]/40 text-xs`) przed nazwiskiem

### 3.3 Sekcja "Ostatnia aktywność" – ulepszenia

Zachowana w całości (filtry all/user/admin, timeline, badge roli). Zmiany wizualne:
- Linia czasu: dodać cienką pionową linię (`border-l-2 border-gray-100 ml-4`) łączącą ikony
- Timestamp: zmienić z godziny (`HH:MM`) na **relatywny czas** – "2 godziny temu", "wczoraj" – lub zostawić godzinę i dodać datę w `title` atrybucie (tooltip)

---

## KROK 4 – AdminKlienci: Tabela z avatarami i licznikiem

> **Plik:** `src/pages/panel/admin/AdminKlienci.tsx`  
> **Zachowane funkcje:** wyszukiwarka (filtrowanie po nazwisku/e-mail/telefon), nawigacja do `AdminClientDetails`

### 4.1 Licznik wyników nad tabelą

Dodać nad tabelą:
```tsx
<p className="text-sm text-gray-500">
  Wyświetlanie: <span className="font-semibold text-gray-800">{filteredProfiles.length}</span> klientów
  {searchTerm && <span> dla frazy "<em>{searchTerm}</em>"</span>}
</p>
```

### 4.2 Avatar inicjałowy w tabeli

W kolumnie "Imię i Nazwisko" przed nazwiskiem:
```tsx
<div className="flex items-center gap-3">
  <div className="h-8 w-8 rounded-full bg-[#C4DEBE]/50 flex items-center justify-center text-xs font-bold text-[#2F5C3A] flex-shrink-0">
    {p.full_name.charAt(0).toUpperCase()}
  </div>
  <span>{p.full_name}</span>
</div>
```

### 4.3 Styl tabeli

- Wrapper: `overflow-hidden rounded-2xl border border-[#C4DEBE]/30`
- `<thead>`: `bg-[#2F5C3A]/5`, tekst `text-[#2F5C3A]`
- Row hover: `hover:bg-[#F0F7EE] transition-colors`
- Input wyszukiwarki: dodać `transition-shadow focus:shadow-md`

---

## KROK 5 – AdminSesje: Karty i przycisk edycji

> **Plik:** `src/pages/panel/admin/AdminSesje.tsx`  
> **Zachowane funkcje:** modal dodawania/edycji, `ConfirmDialog` przy deaktywacji, toast, checkbox is_active

### 5.1 Przycisk "Edytuj"

**Obecny:** plain text link `text-[#48A7C9] hover:underline`

**Nowy:** ikonka + przycisk z obramowaniem:
```tsx
import { Pencil } from 'lucide-react';
// ...
<button
  onClick={() => handleOpenEdit(s)}
  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-[#48A7C9] hover:text-[#48A7C9] transition duration-200"
>
  <Pencil className="h-3.5 w-3.5" />
  Edytuj
</button>
```

### 5.2 Nieaktywne sesje

Zamiast `opacity-70` na całej karcie:
- Karta: `border-dashed border-gray-300 bg-gray-50/30` (normalny kontrast)
- Tytuł: `line-through text-gray-500`
- Badge "Nieaktywna": bardziej widoczny – `bg-red-50 text-red-600 border-red-200`

### 5.3 Animacja kart przy ładowaniu

Dodać `animate-fade-in` na `<div>` siatki kart.

---

## KROK 6 – PacjentDashboard: Wyróżnienie następnej wizyty + countdown

> **Plik:** `src/pages/panel/pacjent/PacjentDashboard.tsx`  
> **Zachowane funkcje:** podział na nadchodzące/historię, tabela historii, link do rezerwacji, filtry dat

### 6.1 Hero card "Następna wizyta"

Pierwsza wizyta z `upcomingBookings` (ta z najbliższą datą) otrzymuje wyróżniony styl:

```tsx
// Hero card dla najbliższej wizyty
<div className="bg-gradient-to-r from-[#2F5C3A] to-[#3a7a4a] text-white rounded-2xl p-6 shadow-md mb-6">
  <p className="text-xs uppercase tracking-widest text-green-200 mb-1">Twoja następna wizyta</p>
  <h4 className="text-xl font-serif font-bold mb-1">{booking.visit_types.title}</h4>
  <p className="text-green-100 text-sm">
    {/* pełna data */}
  </p>
  {/* Countdown */}
  <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-sm font-semibold">
    <Clock className="h-4 w-4" />
    {daysUntil === 0 ? 'Dzisiaj!' : daysUntil === 1 ? 'Jutro' : `Za ${daysUntil} dni`}
  </div>
</div>
```

Pozostałe nadchodzące wizyty renderowane jak dotychczas (karty z `border`).

### 6.2 Helper `getDaysUntil`

```typescript
const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
```

### 6.3 Empty state – brak wizyt

Wzbogacenie `<p>` z "Brak zaplanowanych wizyt":
```tsx
<div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
  <p className="text-sm text-gray-500 font-medium">Brak zaplanowanych wizyt</p>
  <Link to="/rezerwacja" className="...">Zarezerwuj pierwszą wizytę →</Link>
</div>
```

### 6.4 Tabela historii wizyt – ulepszenia

Zachowana w całości. Zmiany wizualne:
- Wrapper: `overflow-hidden rounded-2xl border border-gray-100`
- Thead: `bg-[#2F5C3A]/5`, tekst `text-[#2F5C3A]`
- Animacja: `animate-fade-in` na tablicy

---

## KROK 7 – PacjentProfil: Sekcje formularza

> **Plik:** `src/pages/panel/pacjent/PacjentProfil.tsx`  
> **Zachowane funkcje:** upload avatara, zapis danych, walidacja required, successMsg/errorMsg

### 7.1 Grupowanie pól w sekcje

Podzielić formularz na dwie sekcje z nagłówkami:

**Sekcja 1 – "Dane osobowe":**
- Pole: Imię i nazwisko
- Pole: Numer telefonu (prefix + numer)
- E-mail (readonly, z informacją)

**Sekcja 2 – "Adres zamieszkania":**
- Ulica (add1), Dodatkowe dane (add2)
- Kod pocztowy, Miasto
- Województwo/Powiat, Kraj

Każda sekcja w ramce:
```tsx
<section className="border border-gray-100 rounded-2xl p-6 space-y-4">
  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-3">
    Dane osobowe
  </h3>
  {/* pola */}
</section>
```

### 7.2 Pole e-mail – readonly z etykietą

Zamiast tylko `<p className="text-xs text-gray-400">` pod avatarem, dodać dedykowane pole formularza:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700">
    Adres e-mail <span className="text-gray-400 font-normal">(niezmienialny)</span>
  </label>
  <input
    type="email"
    value={email}
    disabled
    className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
  />
</div>
```

### 7.3 Feedback – inline alerty

Zachowane `successMsg` i `errorMsg`, ale wzbogacone o ikonki:
```tsx
{successMsg && (
  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-[#2F5C3A] px-4 py-3 rounded-xl text-sm">
    <CheckCircle className="h-4 w-4 flex-shrink-0" />
    {successMsg}
  </div>
)}
```

---

## KROK 8 – AdminBookingDetails & AdminClientDetails: Breadcrumbs + Wróć

> **Pliki:** `AdminBookingDetails.tsx`, `AdminClientDetails.tsx`  
> **Zachowane funkcje:** wszystkie akcje (zmiana statusu, edycja), wyświetlane dane

### 8.1 Przycisk "Wróć"

Dodać nad treścią (pod headerem layoutu):
```tsx
import { ArrowLeft } from 'lucide-react';
// ...
<button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2F5C3A] transition duration-200 mb-6 group"
>
  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
  Wróć
</button>
```

### 8.2 Breadcrumbs

Pod nagłówkiem sekcji:
```tsx
<nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
  <Link to="/panel/admin/dashboard" className="hover:text-[#2F5C3A]">Dashboard</Link>
  <span>/</span>
  <Link to="/panel/admin/klienci" className="hover:text-[#2F5C3A]">Klienci</Link>
  <span>/</span>
  <span className="text-gray-700 font-medium">{clientName}</span>
</nav>
```

---

## Kolejność wdrożenia

```
KROK 1 → KROK 2 → KROK 3 → KROK 4 → KROK 5 → KROK 6 → KROK 7 → KROK 8
```

Kroki 1–2 są **prerequisitem** dla reszty (sidebar config + layout). Kroki 3–8 można robić niezależnie po zakończeniu kroków 1–2.

### Szacowany nakład

| Krok | Opis | Czas szacunkowy |
|------|------|----------------|
| 1 | Sidebar config (nowy plik + import w 8 plikach) | ~30 min |
| 2 | PanelLayout (styl sidebara, header, animacja) | ~20 min |
| 3 | AdminDashboard (karty, tabela, timeline) | ~30 min |
| 4 | AdminKlienci (licznik, avatar, tabela) | ~15 min |
| 5 | AdminSesje (przycisk edycji, nieaktywne) | ~15 min |
| 6 | PacjentDashboard (hero card, countdown, empty state) | ~30 min |
| 7 | PacjentProfil (sekcje, e-mail readonly, feedback) | ~20 min |
| 8 | Breadcrumbs + "Wróć" | ~15 min |
| **Razem** | | **~2h 45min** |

---

## Zasady implementacji

1. **Brak usuwania funkcji** – każda istniejąca logika (fetch, filtry, akcje) pozostaje nienaruszona
2. **Tylko klasy Tailwind** – żadnych inline styles, `<style>` tagów
3. **Lucide React** – wszystkie nowe ikony z tej biblioteki (jest już w `package.json`)
4. **Animacje** – używać tylko `animate-fade-in` i `animate-slide-up` zdefiniowanych w `tailwind.config.js`
5. **Kolory** – tylko z palety projektu: `#2F5C3A`, `#48A7C9`, `#C4DEBE`, `#F6FAF4`
6. **TypeScript** – zachować typy, nie używać `any` tam gdzie da się uniknąć

---

## ✅ Checklista postępu

> Odznaczaj podpunkty w miarę implementacji. Krok uznaje się za ukończony gdy wszystkie jego podpunkty są odznaczone.

---

### Krok 1 – Sidebar Config (prerequisit)

- [x] Utworzyć plik `src/config/sidebarConfig.tsx`
- [x] Zdefiniować i wyeksportować tablicę `adminSidebarItems` z ikonami Lucide
- [x] Zdefiniować i wyeksportować tablicę `pacjentSidebarItems` z ikonami Lucide
- [x] `AdminDashboard.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `adminSidebarItems`
- [x] `AdminKlienci.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `adminSidebarItems`
- [x] `AdminSesje.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `adminSidebarItems`
- [x] `AdminUstawienia.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `adminSidebarItems`
- [x] `AdminBookingDetails.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `adminSidebarItems`
- [x] `AdminClientDetails.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `adminSidebarItems`
- [x] `PacjentDashboard.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `pacjentSidebarItems`
- [x] `PacjentProfil.tsx` – usunąć lokalną tablicę `sidebarItems`, zaimportować `pacjentSidebarItems`
- [x] Sprawdzić że sidebar renderuje się poprawnie na wszystkich stronach

---

### Krok 2 – PanelLayout: Sidebar i header

- [x] Zmienić tło sidebara z `bg-white` na `bg-[#F8FBF7]`
- [x] Zmienić styl aktywnego linku na `border-l-4 border-[#48A7C9] bg-[#2F5C3A]/10 text-[#2F5C3A] font-semibold`
- [x] Zmienić hover nieaktywnych linków na `hover:bg-[#2F5C3A]/8 hover:text-[#2F5C3A]`
- [x] Dodać `subtitle?: string` do interfejsu `PanelLayoutProps`
- [x] Renderować `subtitle` pod tytułem strony w headerze (warunkowe `<p>`)
- [x] Przenieść datę z headera do stopki sidebara (nad avatarem użytkownika)
- [x] Zastąpić ręczne SVG w przycisku wylogowania ikoną `<LogOut>` z Lucide
- [x] Opakować `{children}` w `<div className="animate-fade-in">`
- [x] Sprawdzić collapse sidebara (desktop) i drawer (mobile) – że dalej działają

---

### Krok 3 – AdminDashboard: Karty statystyk i tabele

- [x] Karta "Liczba rezerwacji" – dodać gradient `from-blue-50 to-white`, `border-l-4 border-blue-300`, ikonę `<CalendarDays>` w tle
- [x] Karta "Potwierdzone wizyty" – dodać gradient `from-emerald-50 to-white`, `border-l-4 border-emerald-300`, ikonę `<CheckCircle>` w tle
- [x] Karta "Aktywni Klienci" – dodać gradient `from-purple-50 to-white`, `border-l-4 border-purple-300`, ikonę `<Users>` w tle
- [x] Zachować tooltips na hover dla wszystkich 3 kart (bez zmian)
- [x] Tabela rezerwacji – wrapper: `overflow-hidden rounded-2xl`
- [x] Tabela rezerwacji – thead: `bg-[#2F5C3A]/5`, tekst `text-[#2F5C3A]`
- [x] Tabela rezerwacji – row hover: `hover:bg-[#F0F7EE]`
- [x] Tabela rezerwacji – dodać inicjał klienta jako małe kółko przed nazwiskiem
- [x] Timeline aktywności – dodać pionową linię czasu (`border-l-2 border-gray-100`)
- [x] Sprawdzić że filtry all/user/admin w timeline nadal działają

---

### Krok 4 – AdminKlienci: Tabela z avatarami i licznikiem

- [ ] Dodać licznik wyników nad tabelą (z informacją o frazie wyszukiwania gdy aktywna)
- [ ] Dodać avatar inicjałowy (kółko z inicjałem) w kolumnie "Imię i Nazwisko"
- [ ] Wrapper tabeli: `overflow-hidden rounded-2xl border border-[#C4DEBE]/30`
- [ ] Thead: `bg-[#2F5C3A]/5`, tekst `text-[#2F5C3A]`
- [ ] Row hover: `hover:bg-[#F0F7EE] transition-colors`
- [ ] Input wyszukiwarki: dodać `transition-shadow focus:shadow-md`
- [ ] Sprawdzić że wyszukiwanie i nawigacja do `AdminClientDetails` nadal działają

---

### Krok 5 – AdminSesje: Karty i przycisk edycji

- [ ] Zastąpić przycisk "Edytuj" (text link) przyciskiem z ikoną `<Pencil>` i obramowaniem
- [ ] Nieaktywne sesje – zmienić z `opacity-70` na `border-dashed border-gray-300 bg-gray-50/30`
- [ ] Nieaktywne sesje – tytuł: `line-through text-gray-500`
- [ ] Badge "Nieaktywna" – zmienić na `bg-red-50 text-red-600 border-red-200`
- [ ] Dodać `animate-fade-in` na siatce kart
- [ ] Sprawdzić że modal dodawania/edycji działa poprawnie
- [ ] Sprawdzić że `ConfirmDialog` przy deaktywacji nadal się pojawia
- [ ] Sprawdzić że toast przy zapisie/błędzie nadal działa

---

### Krok 6 – PacjentDashboard: Hero card i countdown

- [ ] Wyodrębnić pierwszą wizytę z `upcomingBookings` jako "następna wizyta"
- [ ] Zaimplementować helper `getDaysUntil(dateStr: string): number`
- [ ] Stworzyć hero card z gradientem `from-[#2F5C3A] to-[#3a7a4a]` dla następnej wizyty
- [ ] Dodać countdown ("Dzisiaj!", "Jutro", "Za X dni") na hero card
- [ ] Pozostałe nadchodzące wizyty renderować jak dotychczas (karty z borderem)
- [ ] Ulepszony empty state – ikona `<Calendar>`, tekst, link do `/rezerwacja`
- [ ] Tabela historii – wrapper: `overflow-hidden rounded-2xl border border-gray-100`
- [ ] Tabela historii – thead: `bg-[#2F5C3A]/5`, tekst `text-[#2F5C3A]`
- [ ] Dodać `animate-fade-in` na sekcji z wizytami po załadowaniu
- [ ] Sprawdzić że CTA "Zarezerwuj wizytę" (Link) nadal działa
- [ ] Sprawdzić podział na nadchodzące/historię (filtrowanie po dacie)

---

### Krok 7 – PacjentProfil: Sekcje formularza

- [ ] Stworzyć sekcję "Dane osobowe" z nagłówkiem i ramką (`border border-gray-100 rounded-2xl p-6`)
- [ ] Przenieść pola: imię i nazwisko, telefon do sekcji "Dane osobowe"
- [ ] Stworzyć sekcję "Adres zamieszkania" z nagłówkiem i ramką
- [ ] Przenieść pola: add1, add2, kod pocztowy, miasto, województwo, kraj do sekcji "Adres"
- [ ] Dodać pole e-mail jako `disabled` input z etykietą "(niezmienialny)"
- [ ] `successMsg` – dodać ikonę `<CheckCircle>` z Lucide
- [ ] `errorMsg` – dodać ikonę `<AlertCircle>` z Lucide
- [ ] Sprawdzić że upload avatara nadal działa
- [ ] Sprawdzić że zapis formularza (handleSave) nadal działa
- [ ] Sprawdzić że walidacja `required` na polach nadal działa

---

### Krok 8 – Breadcrumbs i "Wróć"

- [ ] `AdminClientDetails.tsx` – dodać przycisk "Wróć" z ikoną `<ArrowLeft>`
- [ ] `AdminClientDetails.tsx` – dodać breadcrumbs: `Dashboard / Klienci / [Imię klienta]`
- [ ] `AdminBookingDetails.tsx` – dodać przycisk "Wróć" z ikoną `<ArrowLeft>`
- [ ] `AdminBookingDetails.tsx` – dodać breadcrumbs: `Dashboard / Rezerwacje / [ID lub data]`
- [ ] Sprawdzić że `navigate(-1)` w przycisku "Wróć" poprawnie nawiguje

---

### Weryfikacja końcowa

- [ ] Wszystkie strony panelu admina renderują się bez błędów w konsoli
- [ ] Wszystkie strony panelu pacjenta renderują się bez błędów w konsoli
- [ ] Sidebar collapse (desktop) działa poprawnie po zmianach
- [ ] Mobilny drawer działa poprawnie po zmianach
- [ ] Nawigacja między stronami panelu działa bez błędów
- [ ] Brak regresji w logice formularzy i akcjach (zapis, toast, dialog)

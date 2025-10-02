# mgr Joanna Kubiak - Strona Psychologa

Profesjonalna strona internetowa dla psychologa dziecięcego i młodzieży.

## Funkcjonalności

- 📱 Responsywny design
- 📧 Formularz kontaktowy z integracją email
- 🎨 Nowoczesny interfejs użytkownika
- ⚡ Szybkie ładowanie (Vite + React)
- 🔒 Bezpieczne przetwarzanie formularzy (Supabase Edge Functions)

## Technologie

- **Frontend:** React + TypeScript + Tailwind CSS
- **Build:** Vite
- **Backend:** Supabase Edge Functions
- **Email:** Resend API
- **Hosting:** Netlify

## Konfiguracja

1. Sklonuj repozytorium
2. Zainstaluj zależności: `npm install`
3. Skopiuj `.env.example` do `.env` i uzupełnij zmienne
4. Uruchom lokalnie: `npm run dev`

## Zmienne środowiskowe

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

Strona automatycznie wdraża się na Netlify przy każdym push do głównej gałęzi.
-- ==========================================
-- SCHEMA DLA SYSTEMU REZERWACJI (SUPABASE)
-- ==========================================

-- Włączenie rozszerzenia UUID (zazwyczaj włączone domyślnie w Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELA PROFILI UŻYTKOWNIKÓW
-- ==========================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email text UNIQUE,
  full_name text NOT NULL,
  phone_prefix text DEFAULT '+48',
  phone_number text,
  add1 text,
  add2 text,
  post_code text,
  city text,
  county text,
  country text DEFAULT 'Polska',
  role text NOT NULL CHECK (role IN ('user', 'client', 'admin')) DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ==========================================
-- HIERARCHIA UPRAWNIEŃ (HELPER FUNCTION)
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- RLS dla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zalogowani uzytkownicy moga czytac wlasny profil lub admin wszystkie"
  ON public.profiles FOR SELECT
  USING (auth.uid() = auth_id OR public.is_admin());

CREATE POLICY "Zalogowani uzytkownicy moga edytowac wlasny profil lub admin wszystkie"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = auth_id OR public.is_admin())
  WITH CHECK (auth.uid() = auth_id OR public.is_admin());

CREATE POLICY "Admin moze tworzyc profile offline"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin moze usuwac profile"
  ON public.profiles FOR DELETE
  USING (public.is_admin());


-- ==========================================
-- 2. TABELE SŁOWNIKOWE (STATUSY I LOKALIZACJE)
-- ==========================================

-- Słownik statusów rezerwacji
CREATE TABLE public.booking_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  description text
);

ALTER TABLE public.booking_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kazdy moze czytac statusy rezerwacji" ON public.booking_statuses FOR SELECT USING (true);
CREATE POLICY "Tylko admin zarzadza statusami rezerwacji" ON public.booking_statuses FOR ALL USING (public.is_admin());

-- Słownik statusów płatności
CREATE TABLE public.payment_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  description text
);

ALTER TABLE public.payment_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kazdy moze czytac statusy platnosci" ON public.payment_statuses FOR SELECT USING (true);
CREATE POLICY "Tylko admin zarzadza statusami platnosci" ON public.payment_statuses FOR ALL USING (public.is_admin());

-- Słownik typów lokalizacji
CREATE TABLE public.location_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL
);

ALTER TABLE public.location_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kazdy moze czytac typy lokalizacji" ON public.location_types FOR SELECT USING (true);
CREATE POLICY "Tylko admin zarzadza typami lokalizacji" ON public.location_types FOR ALL USING (public.is_admin());


-- ==========================================
-- 3. TYPY WIZYT / SESJI
-- ==========================================
CREATE TABLE public.visit_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  duration integer NOT NULL CHECK (duration > 0), -- w minutach
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wszyscy moga czytac aktywne typy wizyt lub admin wszystkie"
  ON public.visit_types FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Tylko admin zarzadza typami wizyt"
  ON public.visit_types FOR ALL
  USING (public.is_admin());


-- ==========================================
-- 4. REGUŁY DOSTĘPNOŚCI I WYJĄTKI
-- ==========================================

-- Standardowe reguły dostępności (recurrence_rule w formacie JSONB)
CREATE TABLE public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recurrence_rule jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wszyscy moga czytac reguly dostepnosci" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Tylko admin zarzadza regulami dostepnosci" ON public.availability FOR ALL USING (public.is_admin());

-- Urlopy i dni wolne (recurrence_rule wykluczeń w formacie JSONB)
CREATE TABLE public.availability_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recurrence_rule jsonb NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wszyscy moga czytac wyjatki dostepnosci" ON public.availability_exceptions FOR SELECT USING (true);
CREATE POLICY "Tylko admin zarzadza wyjatkami dostepnosci" ON public.availability_exceptions FOR ALL USING (public.is_admin());


-- ==========================================
-- 5. REZERWACJE (BOOKINGS)
-- ==========================================
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visit_type_id uuid NOT NULL REFERENCES public.visit_types(id) ON DELETE RESTRICT,
  scheduled_at timestamp with time zone NOT NULL,
  status_id uuid NOT NULL REFERENCES public.booking_statuses(id) ON DELETE RESTRICT,
  payment_status_id uuid NOT NULL REFERENCES public.payment_statuses(id) ON DELETE RESTRICT,
  location_id uuid NOT NULL REFERENCES public.location_types(id) ON DELETE RESTRICT,
  is_first_visit boolean NOT NULL DEFAULT false,
  cancellation_reason text,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uzytkownicy widza wlasne rezerwacje lub admin wszystkie"
  ON public.bookings FOR SELECT
  USING (
    client_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Uzytkownicy moga tworzyc wlasne rezerwacje lub admin wszystkie"
  ON public.bookings FOR INSERT
  WITH CHECK (
    client_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Uzytkownicy moga aktualizowac wlasne rezerwacje lub admin wszystkie"
  ON public.bookings FOR UPDATE
  USING (
    client_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    client_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Tylko admin moze usuwac rezerwacje z bazy"
  ON public.bookings FOR DELETE
  USING (public.is_admin());


-- ==========================================
-- 6. USTAWIENIA GLOBALNE APLIKACJI
-- ==========================================
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wszyscy moga czytac ustawienia aplikacji" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Tylko admin zarzadza ustawieniami aplikacji" ON public.app_settings FOR ALL USING (public.is_admin());


-- ==========================================
-- 7. DZIENNIK ZDARZEŃ (AUDIT LOGS)
-- ==========================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tylko admin moze czytac audit_logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Zalogowani i admin moga zapisywac logi" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());


-- ==========================================
-- PROCEDURY BAZODANOWE I TRIGERRY
-- ==========================================

-- A. Automatyczne tworzenie profilu po rejestracji w Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Sprawdzamy czy profil z tym adresem email już istnieje (np. dodany offline)
  SELECT id INTO existing_profile_id FROM public.profiles WHERE email = new.email LIMIT 1;
  
  IF existing_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_id = new.id,
        full_name = COALESCE(NULLIF(full_name, ''), COALESCE(new.raw_user_meta_data->>'full_name', 'Użytkownik')),
        email = new.email
    WHERE id = existing_profile_id;
  ELSE
    INSERT INTO public.profiles (auth_id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', 'Użytkownik'),
      'user'
    );
  END IF;
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- B. Automatyczna zmiana roli z 'user' na 'client' po pomyślnym utworzeniu pierwszej rezerwacji
CREATE OR REPLACE FUNCTION public.handle_update_role_on_booking()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'client'
  WHERE id = new.client_id AND role = 'user';
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER update_role_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_role_on_booking();


-- C. Wyzwalacz sprawdzający pierwszą wizytę (is_first_visit)
CREATE OR REPLACE FUNCTION public.handle_check_is_first_visit()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  confirmed_status_id uuid;
  completed_status_id uuid;
  existing_count integer;
BEGIN
  -- Pobieramy ID statusów 'confirmed' oraz 'completed'
  SELECT id INTO confirmed_status_id FROM public.booking_statuses WHERE name = 'confirmed';
  SELECT id INTO completed_status_id FROM public.booking_statuses WHERE name = 'completed';

  -- Liczymy dotychczasowe rezerwacje o tych statusach dla danego klienta
  SELECT count(*) INTO existing_count
  FROM public.bookings
  WHERE client_id = new.client_id
    AND (status_id = confirmed_status_id OR status_id = completed_status_id);

  IF existing_count = 0 THEN
    new.is_first_visit := true;
  ELSE
    new.is_first_visit := false;
  END IF;

  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER check_is_first_visit
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_check_is_first_visit();


-- ==========================================
-- DOMYŚLNE DANE SŁOWNIKOWE (SEEDS)
-- ==========================================

-- Domyślne statusy rezerwacji
INSERT INTO public.booking_statuses (name, label, description) VALUES
  ('pending', 'Oczekująca', 'Rezerwacja oczekuje na zatwierdzenie przez administratora'),
  ('confirmed', 'Potwierdzona', 'Rezerwacja została zatwierdzona'),
  ('completed', 'Zrealizowana', 'Wizyta odbyła się pomyślnie'),
  ('cancelled', 'Anulowana', 'Rezerwacja została anulowana')
ON CONFLICT (name) DO NOTHING;

-- Domyślne statusy płatności
INSERT INTO public.payment_statuses (name, label, description) VALUES
  ('unpaid', 'Nieopłacona', 'Wizyta nie została jeszcze opłacona'),
  ('paid_on_site', 'Opłacona na miejscu', 'Płatność zostanie uregulowana w gabinecie')
ON CONFLICT (name) DO NOTHING;

-- Domyślne typy lokalizacji
INSERT INTO public.location_types (name, label) VALUES
  ('office', 'W gabinecie'),
  ('online', 'Online')
ON CONFLICT (name) DO NOTHING;

-- Przykładowe/Domyślne ustawienia aplikacji
INSERT INTO public.app_settings (key, value, description) VALUES
  ('advance_booking_limit', '{"limit": 4, "unit": "weeks"}'::jsonb, 'Maksymalny czas wyprzedzenia rezerwacji'),
  ('booking_validation_rules', '{"requirePhone": true}'::jsonb, 'Warunki walidacji rejestracji i rezerwacji')
ON CONFLICT (key) DO NOTHING;

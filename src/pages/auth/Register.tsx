import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DatePicker } from '../../components/DatePicker';
import { Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+48');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo;

  const maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  const calculateAge = (birthDateStr: string): number => {
    if (!birthDateStr) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!dateOfBirth) {
      setErrorMsg('Podanie daty urodzenia jest wymagane.');
      setLoading(false);
      return;
    }

    if (calculateAge(dateOfBirth) < 18) {
      setErrorMsg('Rejestracja w serwisie jest dostępna wyłącznie dla osób pełnoletnich (ukończone 18 lat).');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Hasła nie pasują do siebie.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_prefix: phonePrefix,
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth,
          },
        },
      });

      if (error) throw error;

      // Jeśli sesja jest od razu dostępna (np. brak weryfikacji maila w Supabase)
      if (data?.session) {
        navigate(returnTo || '/panel/pacjent/dashboard');
        return;
      }

      // Sukces rejestracji (wymaga potwierdzenia e-maila)
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd podczas rejestracji.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-green-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-soft border border-light-green/30 text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-200">
            <svg className="h-10 w-10 text-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-serif font-bold text-dark-green">Konto utworzone!</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Sprawdź swoją skrzynkę e-mail, aby potwierdzić rejestrację i aktywować konto.
          </p>
          <div className="mt-8">
            <Link
              to="/auth/login"
              state={{ returnTo }}
              className="inline-flex justify-center py-3.5 px-6 border border-transparent text-sm font-medium rounded-xl text-white bg-dark-green hover:bg-dark-green/90 transition duration-300 shadow-soft"
            >
              Przejdź do logowania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-green-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-soft border border-light-green/30 animate-fade-in">
        <div>
          <div className="flex justify-center">
            <Link to="/" className="font-serif text-3xl font-bold text-dark-green hover:text-pastel-blue transition duration-300">
              Joanna Kubiak
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-dark-green">
            Zarejestruj się
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masz już konto?{' '}
            <Link to="/auth/login" state={{ returnTo }} className="font-medium text-pastel-blue hover:text-pastel-blue-hover transition duration-300">
              Zaloguj się
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error-bg border border-error/20 text-error px-4 py-3 rounded-xl text-sm" role="alert">
            <span className="block sm:inline">{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
              Imię i Nazwisko
            </label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
              placeholder="np. Anna Nowak"
            />
          </div>

          <div>
            <label htmlFor="date-of-birth" className="block text-sm font-medium text-gray-700">
              Data urodzenia <span className="text-red-500">* (wymagane ukończone 18 lat)</span>
            </label>
            <DatePicker
              id="date-of-birth"
              name="dateOfBirth"
              required
              value={dateOfBirth}
              onChange={setDateOfBirth}
              maxDate={maxBirthDate}
              placeholder="Wybierz datę urodzenia..."
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
              Numer telefonu (opcjonalnie)
            </label>
            <div className="mt-1 flex gap-2">
              <select
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className="px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm bg-white"
              >
                <option value="+48">+48 (PL)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+49">+49 (DE)</option>
                <option value="+1">+1 (US)</option>
              </select>
              <input
                id="phone-number"
                name="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
                placeholder="600 000 000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
              Adres e-mail
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
              placeholder="np. anna.nowak@przyklad.pl"
            />
          </div>

          <div>
            <label htmlFor="password-field" className="block text-sm font-medium text-gray-700">
              Hasło
            </label>
            <div className="relative mt-1">
              <input
                id="password-field"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
                placeholder="min. 6 znaków"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition"
                title={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password-field" className="block text-sm font-medium text-gray-700">
              Potwierdź hasło
            </label>
            <div className="relative mt-1">
              <input
                id="confirm-password-field"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition"
                title={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-dark-green hover:bg-dark-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-green transition duration-300 shadow-soft"
            >
              {loading ? (
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                </div>
              ) : (
                'Zarejestruj się'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-dark-green transition duration-300">
            ← Powrót do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
};

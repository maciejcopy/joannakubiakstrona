import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

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
          },
        },
      });

      if (error) throw error;

      // Sukces rejestracji
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd podczas rejestracji.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6FAF4] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-soft border border-[#C4DEBE]/30 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-200">
            <svg className="h-10 w-10 text-[#2F5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-serif font-bold text-[#2F5C3A]">Konto utworzone!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sprawdź swoją skrzynkę e-mail, aby potwierdzić rejestrację i aktywować konto.
          </p>
          <div className="mt-8">
            <Link
              to="/auth/login"
              className="inline-flex justify-center py-3.5 px-6 border border-transparent text-sm font-medium rounded-xl text-white bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 transition duration-300 shadow-soft"
            >
              Przejdź do logowania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6FAF4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-soft border border-[#C4DEBE]/30">
        <div>
          <div className="flex justify-center">
            <Link to="/" className="font-serif text-3xl font-bold text-[#2F5C3A] hover:text-[#48A7C9] transition duration-300">
              Joanna Kubiak
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-[#2F5C3A]">
            Zarejestruj się
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masz już konto?{' '}
            <Link to="/auth/login" className="font-medium text-[#48A7C9] hover:text-[#3A8BA8] transition duration-300">
              Zaloguj się
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
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
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
              placeholder="np. Anna Nowak"
            />
          </div>

          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
              Adres e-mail
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
              placeholder="np. anna.nowak@przyklad.pl"
            />
          </div>

          <div>
            <label htmlFor="password-field" className="block text-sm font-medium text-gray-700">
              Hasło
            </label>
            <input
              id="password-field"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
              placeholder="min. 6 znaków"
            />
          </div>

          <div>
            <label htmlFor="confirm-password-field" className="block text-sm font-medium text-gray-700">
              Potwierdź hasło
            </label>
            <input
              id="confirm-password-field"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F5C3A] transition duration-300 shadow-soft"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Zarejestruj się'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-[#2F5C3A] transition duration-300">
            ← Powrót do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
};

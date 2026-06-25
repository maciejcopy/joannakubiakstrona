import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Sprawdź returnTo ze state (np. po przekierowaniu z rezerwacji)
      const returnTo = (location.state as any)?.returnTo;

      // Sprawdź rolę, aby przekierować w odpowiednie miejsce
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_id', data.user.id)
        .single();

      if (returnTo) {
        navigate(returnTo);
      } else if (profile?.role === 'admin') {
        navigate('/panel/admin/dashboard');
      } else {
        navigate('/panel/pacjent/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd podczas logowania.');
    } finally {
      setLoading(false);
    }
  };

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
            Zaloguj się do panelu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{' '}
            <Link to="/auth/register" className="font-medium text-pastel-blue hover:text-pastel-blue-hover transition duration-300">
              utwórz nowe konto pacjenta
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error-bg border border-error/20 text-error px-4 py-3 rounded-xl text-sm" role="alert">
            <span className="block sm:inline">{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
                placeholder="twoj.email@przyklad.pl"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Hasło
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm transition duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
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
                'Zaloguj się'
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

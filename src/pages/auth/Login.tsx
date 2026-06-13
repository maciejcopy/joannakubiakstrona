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

      // Sprawdź rolę, aby przekierować w odpowiednie miejsce
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
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
    <div className="min-h-screen flex items-center justify-center bg-[#F6FAF4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-soft border border-[#C4DEBE]/30">
        <div>
          <div className="flex justify-center">
            <Link to="/" className="font-serif text-3xl font-bold text-[#2F5C3A] hover:text-[#48A7C9] transition duration-300">
              Joanna Kubiak
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-[#2F5C3A]">
            Zaloguj się do panelu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{' '}
            <Link to="/auth/register" className="font-medium text-[#48A7C9] hover:text-[#3A8BA8] transition duration-300">
              utwórz nowe konto pacjenta
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F5C3A] transition duration-300 shadow-soft"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Zaloguj się'
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

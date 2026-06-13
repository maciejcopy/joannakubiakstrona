import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Unauthorized: React.FC = () => {
  const [role, setRole] = useState<'user' | 'client' | 'admin' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();
        if (profile) {
          setRole(profile.role as any);
        }
      }
    }
    checkRole();
  }, []);

  const handleGoDashboard = () => {
    if (role === 'admin') {
      navigate('/panel/admin/dashboard');
    } else if (role === 'user' || role === 'client') {
      navigate('/panel/pacjent/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6FAF4] px-4">
      <div className="max-w-md w-full text-center p-10 bg-white rounded-3xl shadow-soft border border-[#C4DEBE]/35">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 border border-red-200 mb-6">
          <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-[#2F5C3A] mb-4">
          Brak autoryzacji
        </h1>
        
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Niestety, nie posiadasz uprawnień wymaganych do wyświetlenia tej strony panelu administratora.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoDashboard}
            className="w-full py-3.5 px-4 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-medium rounded-xl transition duration-300 shadow-soft"
          >
            Przejdź do swojego panelu
          </button>
          
          <Link
            to="/"
            className="block text-sm text-[#48A7C9] hover:text-[#3A8BA8] transition duration-300 font-semibold"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
};

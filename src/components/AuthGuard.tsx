import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'client' | 'admin')[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'client' | 'admin' | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }

        // Pobierz profil użytkownika z bazy, aby poznać jego rolę
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();

        if (error) {
          console.error('Błąd pobierania roli:', error.message);
          // Jeśli profil jeszcze nie istnieje (np. wyzwalacz się opóźnił), domyślnie ustawiamy 'user'
          if (mounted) {
            setIsAuthenticated(true);
            setUserRole('user');
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setIsAuthenticated(true);
          setUserRole(profile.role as 'user' | 'client' | 'admin');
          setLoading(false);
        }
      } catch (err) {
        console.error('Błąd autoryzacji:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    // Nasłuchiwanie na zmiany stanu autoryzacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false);
        }
      } else if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-green-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#C4DEBE]/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#2F5C3A] animate-spin"></div>
          </div>
          <p className="text-[#2F5C3A] font-medium animate-pulse font-serif">Trwa autoryzacja...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Przekierowanie do logowania z zachowaniem poprzedniej ścieżki
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Brak uprawnień do danej ścieżki - przekieruj na stronę braku autoryzacji
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

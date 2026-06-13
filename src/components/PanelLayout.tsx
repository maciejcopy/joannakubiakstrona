import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface PanelLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'pacjent' | 'admin';
  sidebarItems: SidebarItem[];
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({ children, title, role, sidebarItems }) => {
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('auth_id', user.id)
          .single();

        setUserName(profile?.full_name || user.email || 'Użytkownik');

        if (profile?.avatar_url) {
          try {
            const { data: signedData, error } = await supabase.storage
              .from('avatars')
              .createSignedUrl(profile.avatar_url, 60 * 60); // 1 hour
            if (!error && signedData) {
              setAvatarUrl(signedData.signedUrl);
            }
          } catch (err) {
            console.error('Error loading avatar in PanelLayout:', err);
          }
        }
      }
    }
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F6FAF4] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#C4DEBE]/35 flex flex-col justify-between p-6 shadow-soft">
        <div>
          {/* Brand Logo */}
          <div className="mb-8">
            <Link to="/" className="font-serif text-2xl font-bold text-[#2F5C3A] hover:text-[#48A7C9] transition duration-300">
              Joanna Kubiak
            </Link>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
              {role === 'admin' ? 'Panel Administratora' : 'Panel Pacjenta'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {sidebarItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-300 ${
                    isActive
                      ? 'bg-[#2F5C3A] text-white shadow-soft'
                      : 'text-gray-600 hover:bg-[#F6FAF4]/50 hover:text-[#2F5C3A]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section in sidebar footer */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <Link
            to={role === 'admin' ? '/profil' : '/panel/pacjent/profil'}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition duration-200 group/profile"
          >
            <div className="h-10 w-10 rounded-full bg-[#C4DEBE]/40 flex items-center justify-center font-bold text-[#2F5C3A] overflow-hidden border border-[#C4DEBE]/35 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Awatar" className="h-full w-full object-cover" />
              ) : (
                userName ? userName.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate group-hover/profile:text-[#2F5C3A] transition duration-200">{userName}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition duration-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2F5C3A]">{title}</h2>
          <div className="text-xs text-gray-400">
            Dzisiejsza data: {new Date().toLocaleDateString('pl-PL')}
          </div>
        </header>
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-[#C4DEBE]/20">
          {children}
        </div>
      </main>
    </div>
  );
};

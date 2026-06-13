import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="min-h-screen bg-[#F6FAF4] flex flex-col md:flex-row relative">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#C4DEBE]/35 sticky top-0 z-30 shadow-sm">
        <div>
          <Link to="/" className="font-serif text-xl font-bold text-[#2F5C3A] hover:text-[#48A7C9] transition duration-300">
            Joanna Kubiak
          </Link>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
            {role === 'admin' ? 'Panel Admina' : 'Panel Pacjenta'}
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-[#2F5C3A] hover:bg-gray-50 rounded-xl transition duration-200 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-[#C4DEBE]/35 flex flex-col justify-between p-6 shadow-soft transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 md:p-4' : 'md:w-64'}`}
      >
        <div>
          {/* Brand Logo & Collapse Toggle */}
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed ? (
              <div>
                <Link to="/" className="font-serif text-2xl font-bold text-[#2F5C3A] hover:text-[#48A7C9] transition duration-300">
                  Joanna Kubiak
                </Link>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                  {role === 'admin' ? 'Panel Administratora' : 'Panel Pacjenta'}
                </div>
              </div>
            ) : (
              <Link to="/" className="font-serif text-2xl font-bold text-[#2F5C3A] hover:text-[#48A7C9] transition duration-300 mx-auto">
                JK
              </Link>
            )}

            <div className="flex items-center gap-1">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-1.5 text-gray-500 hover:text-[#2F5C3A] hover:bg-gray-100 rounded-lg transition duration-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:block p-1.5 text-gray-500 hover:text-[#2F5C3A] hover:bg-gray-100 rounded-lg transition duration-200"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
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
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-300 ${
                    isCollapsed ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'bg-[#2F5C3A] text-white shadow-soft'
                      : 'text-gray-600 hover:bg-[#F6FAF4]/50 hover:text-[#2F5C3A]'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section in sidebar footer */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <Link
            to={role === 'admin' ? '/profil' : '/panel/pacjent/profil'}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition duration-200 group/profile ${
              isCollapsed ? 'justify-center p-1' : ''
            }`}
            title={isCollapsed ? userName : undefined}
          >
            <div className="h-10 w-10 rounded-full bg-[#C4DEBE]/40 flex items-center justify-center font-bold text-[#2F5C3A] overflow-hidden border border-[#C4DEBE]/35 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Awatar" className="h-full w-full object-cover" />
              ) : (
                userName ? userName.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate group-hover/profile:text-[#2F5C3A] transition duration-200">{userName}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition duration-300 ${
              isCollapsed ? 'px-2' : ''
            }`}
            title={isCollapsed ? "Wyloguj się" : undefined}
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>Wyloguj się</span>}
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

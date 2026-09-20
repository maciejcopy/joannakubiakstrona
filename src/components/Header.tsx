import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Mail, User, Calendar, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setAvatarUrl(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('auth_id', userId)
        .single();
      if (data) {
        setProfile(data);
        if (data.avatar_url) {
          const { data: signedData, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_url, 60 * 60); // 1 hour
          if (!error && signedData) {
            setAvatarUrl(signedData.signedUrl);
          }
        } else {
          setAvatarUrl(null);
        }
      }
    } catch (err) {
      console.error('Error fetching profile in header:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (targetPath: string) => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleHomeClick = () => {
    setIsMenuOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
      navigate('/');
    }
  };

  return (
    <header className="bg-warm-beige/95 backdrop-blur-md border-b border-light-green/20 sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-5">

          {/* Logo i nazwa — Kliknięcie przewija do samej góry */}
          <div>
            <Link 
              to="/" 
              onClick={handleBrandClick}
              className="group flex flex-col justify-center focus:outline-none"
            >
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-green font-serif tracking-tight group-hover:text-dark-green/80 transition-colors">
                mgr Joanna Kubiak
              </h1>
              <p className="text-xs sm:text-sm font-medium text-dark-green/65 tracking-wide">
                psycholog dzieci i młodzieży
              </p>
            </Link>
          </div>

          {/* Nawigacja desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button
              onClick={handleHomeClick}
              className="text-sm font-medium text-gray-700 hover:text-dark-green hover:bg-white transition-all duration-200 px-3.5 py-1.5 rounded-full"
            >
              Strona główna
            </button>

            <button
              onClick={() => handleNavClick('/kontakt')}
              className="text-sm font-medium text-gray-700 hover:text-dark-green hover:bg-white transition-all duration-200 px-3.5 py-1.5 rounded-full"
            >
              Kontakt
            </button>
            
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-transparent hover:bg-white transition duration-200 focus:outline-none"
                  aria-label="Menu profilu"
                >
                  <div className="h-7 w-7 rounded-full bg-[#C4DEBE]/50 flex items-center justify-center font-bold text-[#2F5C3A] text-xs overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Awatar" className="h-full w-full object-cover" />
                    ) : (
                      profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="text-xs font-semibold text-dark-green max-w-[100px] truncate">
                    {profile?.full_name?.split(' ')[0] || 'Konto'}
                  </span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || 'Użytkownik'}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      to={profile?.role === 'admin' ? '/panel/admin/dashboard' : '/panel/pacjent/dashboard'}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F6FAF4]/70 hover:text-[#2F5C3A] transition duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4 text-dark-green/70" />
                      <span>Panel pacjenta</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Wyloguj się</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => window.scrollTo(0, 0)}
                className="text-sm font-medium text-gray-700 hover:text-dark-green hover:bg-white px-3.5 py-1.5 rounded-full transition-all duration-200"
              >
                Panel / Logowanie
              </Link>
            )}

            <Link
              to="/rezerwacja"
              state={{ from: location.pathname }}
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 bg-[#48A7C9] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#3A8BA8] transition-all duration-300 shadow-soft hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Zarezerwuj wizytę</span>
            </Link>
          </nav>

          {/* Przycisk menu mobilne */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-dark-green bg-white/60 border border-light-green/30 hover:bg-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Rozwijane Menu Mobilne - Nowoczesny wygląd */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border border-light-green/30 rounded-3xl p-4 my-2 shadow-xl space-y-3 animate-fade-in">
            <nav className="flex flex-col space-y-1.5">
              <button
                onClick={handleHomeClick}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isHome 
                    ? 'bg-[#2F5C3A] text-white shadow-soft' 
                    : 'text-gray-700 hover:bg-light-green-bg/60 hover:text-dark-green'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Strona główna</span>
              </button>

              <button
                onClick={() => handleNavClick('/kontakt')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  location.pathname === '/kontakt' 
                    ? 'bg-[#2F5C3A] text-white shadow-soft' 
                    : 'text-gray-700 hover:bg-light-green-bg/60 hover:text-dark-green'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Kontakt</span>
              </button>
              
              {session ? (
                <div className="bg-[#F6FAF4] border border-[#C4DEBE]/30 rounded-2xl p-3 my-1 space-y-2">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="h-9 w-9 rounded-full bg-[#2F5C3A] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Awatar" className="h-full w-full object-cover" />
                      ) : (
                        profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 truncate">{profile?.full_name || 'Użytkownik'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavClick(profile?.role === 'admin' ? '/panel/admin/dashboard' : '/panel/pacjent/dashboard')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-dark-green bg-white border border-gray-200/80 shadow-2xs hover:bg-gray-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-dark-green/70" />
                    <span>Przejdź do Panelu Pacjenta</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Wyloguj się</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick('/auth/login')}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-light-green-bg/60 hover:text-dark-green transition-all"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Panel / Logowanie</span>
                </button>
              )}

              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('/rezerwacja')}
                  className="w-full flex items-center justify-center gap-2 bg-[#48A7C9] hover:bg-[#3A8BA8] text-white font-semibold py-3.5 px-5 rounded-2xl text-sm transition shadow-soft"
                >
                  <Calendar className="w-4.5 h-4.5" />
                  <span>Zarezerwuj wizytę</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

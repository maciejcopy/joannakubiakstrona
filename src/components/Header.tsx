import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-warm-beige shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo i nazwa */}
          <div>
            <Link to="/" className="hover:opacity-95 transition">
              <h1 className="text-2xl sm:text-3xl font-bold text-dark-green font-serif">
                mgr Joanna Kubiak
              </h1>
              <p className="text-sm text-gray-500">psycholog dzieci i młodzieży</p>
            </Link>
          </div>

          {/* Nawigacja desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('strona-glowna')}
              className="text-gray-600 hover:text-pastel-blue transition-colors duration-300 font-medium"
            >
              Strona główna
            </button>
            <button
              onClick={() => scrollToSection('kontakt')}
              className="text-gray-600 hover:text-pastel-blue transition-colors duration-300 font-medium"
            >
              Kontakt
            </button>
            
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                  aria-label="Menu profilu"
                >
                  <div className="h-9 w-9 rounded-full bg-[#C4DEBE]/40 flex items-center justify-center font-bold text-[#2F5C3A] border border-[#C4DEBE]/65 overflow-hidden hover:opacity-95 transition">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Awatar" className="h-full w-full object-cover" />
                    ) : (
                      profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || 'Użytkownik'}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      to={profile?.role === 'admin' ? '/profil' : '/panel/pacjent/profil'}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F6FAF4]/50 hover:text-[#2F5C3A] transition duration-200"
                    >
                      Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                    >
                      Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="text-gray-600 hover:text-pastel-blue transition-colors duration-300 font-medium"
              >
                Panel / Logowanie
              </Link>
            )}

            <Link
              to="/rezerwacja"
              className="bg-[#48A7C9] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#3A8BA8] transition-all duration-300 shadow-soft"
            >
              Zarezerwuj wizytę
            </Link>
          </nav>

          {/* Przycisk menu mobilne */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-dark-green hover:text-light-green transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu mobilne */}
        {isMenuOpen && (
          <div className="lg:hidden bg-warm-beige border-t border-light-green py-6 shadow-soft">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => scrollToSection('strona-glowna')}
                className="text-left text-gray-700 hover:text-pastel-blue hover:bg-light-green-bg transition-all duration-300 font-medium py-4 px-4 rounded-lg mx-2 min-h-[44px] flex items-center text-lg"
              >
                Strona główna
              </button>
              <button
                onClick={() => scrollToSection('kontakt')}
                className="text-left text-gray-700 hover:text-pastel-blue hover:bg-light-green-bg transition-all duration-300 font-medium py-4 px-4 rounded-lg mx-2 min-h-[44px] flex items-center text-lg"
              >
                Kontakt
              </button>
              
              {session ? (
                <>
                  <div className="px-4 py-3 bg-[#F6FAF4]/45 rounded-xl mx-2 flex items-center gap-3 border border-[#C4DEBE]/20 mt-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-[#C4DEBE]/40 flex items-center justify-center font-bold text-[#2F5C3A] overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Awatar" className="h-full w-full object-cover" />
                      ) : (
                        profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || 'Użytkownik'}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to={profile?.role === 'admin' ? '/profil' : '/panel/pacjent/profil'}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-left text-gray-700 hover:text-pastel-blue hover:bg-light-green-bg transition-all duration-300 font-medium py-3 px-4 rounded-lg mx-2 min-h-[44px] flex items-center text-lg"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:bg-red-50 transition-all duration-300 font-medium py-3 px-4 rounded-lg mx-2 min-h-[44px] flex items-center text-lg"
                  >
                    Wyloguj się
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-left text-gray-700 hover:text-pastel-blue hover:bg-light-green-bg transition-all duration-300 font-medium py-4 px-4 rounded-lg mx-2 min-h-[44px] flex items-center text-lg"
                >
                  Panel / Logowanie
                </Link>
              )}

              <Link
                to="/rezerwacja"
                onClick={() => setIsMenuOpen(false)}
                className="text-center bg-[#48A7C9] text-white font-semibold py-4 px-4 rounded-lg mx-2 min-h-[44px] flex items-center justify-center text-lg shadow-soft hover:bg-[#3A8BA8] transition duration-300"
              >
                Zarezerwuj wizytę
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

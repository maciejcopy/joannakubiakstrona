import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link
              to="/auth/login"
              className="text-gray-600 hover:text-pastel-blue transition-colors duration-300 font-medium"
            >
              Panel / Logowanie
            </Link>
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
              <Link
                to="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-gray-700 hover:text-pastel-blue hover:bg-light-green-bg transition-all duration-300 font-medium py-4 px-4 rounded-lg mx-2 min-h-[44px] flex items-center text-lg"
              >
                Panel / Logowanie
              </Link>
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

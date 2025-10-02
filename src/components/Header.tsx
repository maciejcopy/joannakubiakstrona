import React, { useState } from 'react';
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
    <header className="bg-warm-beige shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo i nazwa */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-green">
              mgr Joanna Kubiak
            </h1>
            <p className="text-sm text-gray-500">psycholog dzieci i młodzieży</p>
          </div>

          {/* Nawigacja desktop */}
          <nav className="hidden lg:flex space-x-8">
            <button
              onClick={() => scrollToSection('strona-glowna')}
              className="text-gray-600 hover:text-light-green transition-colors duration-300 font-medium"
            >
              Strona główna
            </button>
            <button
              onClick={() => scrollToSection('kontakt')}
              className="text-gray-600 hover:text-light-green transition-colors duration-300 font-medium"
            >
              Kontakt
            </button>
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
          <div className="lg:hidden bg-white border-t border-gray-200 py-6 shadow-lg">
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../TopBar';
import Header from '../Header';
import Footer from '../Footer';
import { ArrowLeft, Calendar, ShieldCheck, FileText } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  icon?: 'shield' | 'file';
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle = "Oficjalny dokument prawny serwisu joannakubiakpsycholog.pl",
  lastUpdated = "[TUTAJ_DATA]",
  icon = 'file',
  children
}) => {
  return (
    <div className="min-h-screen bg-light-green-bg/25 flex flex-col justify-between">
      <div>
        <TopBar />
        <Header />

        {/* Hero / Nagłówek dokumentu */}
        <section className="bg-gradient-to-b from-warm-beige/60 to-transparent py-10 sm:py-14 border-b border-light-green/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {/* Nawigacja okruszkowa / Powrót */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm font-medium text-dark-green/80 hover:text-dark-green transition-colors bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-light-green/30 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Wróć do strony głównej</span>
              </Link>

              <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 px-3 py-1 rounded-full border border-gray-200">
                <Calendar className="w-3.5 h-3.5 text-dark-green" />
                <span>Ostatnia aktualizacja: <strong className="text-gray-700">{lastUpdated}</strong></span>
              </div>
            </div>

            {/* Tytuł i opis */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-dark-green text-white rounded-2xl shadow-soft hidden sm:flex shrink-0">
                {icon === 'shield' ? (
                  <ShieldCheck className="w-7 h-7 text-[#C4DEBE]" />
                ) : (
                  <FileText className="w-7 h-7 text-[#C4DEBE]" />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-dark-green tracking-tight mb-2">
                  {title}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Główna treść dokumentu */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-10 sm:py-14">
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-light-green/25">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default LegalLayout;

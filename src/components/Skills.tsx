import React from 'react';
import { Brain, Heart, Users, CheckCircle2, Globe } from 'lucide-react';

const Skills: React.FC = () => {
  const targetGroups = [
    'Praca z dziećmi od 6 lat',
    'Dzieci i młodzież w wieku szkolnym',
    'Konsultacje indywidualne – pomoc dorosłym',
    'Trudności w relacjach rodzice-dzieci i problemy wychowawcze',
    'Problemy w relacjach rówieśniczych i szkolnych',
  ];

  const difficulties = [
    'ADHD i zaburzenia koncentracji',
    'Stany depresyjne i depresja',
    'Lęki, fobie i zaburzenia lękowe',
    'Trudności emocjonalne (niska samoocena, nieśmiałość, agresja)',
    'Zaburzenia snu, bezsenność i nadmierny stres',
    'Trudności szkolne i kryzysy życiowe',
    'Zaburzenia emocjonalne i uzależnienia',
  ];

  const services = [
    'Konsultacje stacjonarne w gabinecie',
    'Konsultacje indywidualne online',
    'Diagnoza i interwencja kryzysowa',
    'Terapia i wsparcie rodzinne',
  ];

  return (
    <section id="kompetencje" className="py-20 lg:py-24 bg-warm-beige">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header sekcji */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-green mb-4 text-balance">
              Informacje o specjalizacji
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
              Poznaj moje obszary działania i specjalizacje
            </p>
          </div>

          {/* 3 czytelne filary */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* 1. Komu pomagam */}
            <div className="bg-white rounded-2xl p-7 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100/80">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-light-green/40 text-dark-green mr-4">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-green">
                    Komu pomagam
                  </h3>
                  <p className="text-xs text-gray-500">Grupa docelowa i relacje</p>
                </div>
              </div>
              <ul className="space-y-3.5 flex-grow text-gray-600 text-sm leading-relaxed">
                {targetGroups.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-light-green flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Obszary pracy i trudności */}
            <div className="bg-white rounded-2xl p-7 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100/80">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-accent-orange/20 text-accent-orange mr-4">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-green">
                    Obszary pracy
                  </h3>
                  <p className="text-xs text-gray-500">Wyzwania i trudności</p>
                </div>
              </div>
              <div className="space-y-3.5 flex-grow text-gray-600 text-sm leading-relaxed">
                {difficulties.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-orange/60 flex-shrink-0 mt-2" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Formy pomocy i usługi */}
            <div className="bg-white rounded-2xl p-7 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100/80 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-pastel-blue/20 text-dark-green mr-4">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-green">
                    Formy pomocy
                  </h3>
                  <p className="text-xs text-gray-500">Konsultacje i wsparcie</p>
                </div>
              </div>
              <ul className="space-y-3.5 flex-grow text-gray-600 text-sm leading-relaxed">
                {services.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-pastel-blue flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Języki w subtelnym bloku */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-600 bg-warm-beige/40 p-3 rounded-xl">
                <Globe className="w-4 h-4 text-dark-green flex-shrink-0" />
                <span>Konsultacje w języku <strong>polskim</strong> (ojczystym) oraz <strong>angielskim</strong></span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;

import React from 'react';
import { useState } from 'react';
import { Brain, Heart, GraduationCap, Globe, User, Stethoscope } from 'lucide-react';

const Skills: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAreasExpanded, setIsAreasExpanded] = useState(false);
  const [isFirstVisitExpanded, setIsFirstVisitExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleAreasExpanded = () => {
    setIsAreasExpanded(!isAreasExpanded);
  };

  const toggleFirstVisitExpanded = () => {
    setIsFirstVisitExpanded(!isFirstVisitExpanded);
  };

  return (
    <section id="kompetencje" className="py-16 bg-warm-beige">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header sekcji */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-green mb-4">
              Informacje o specjalizacji
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Poznaj moje obszary działania i specjalizacje
            </p>
          </div>

          {/* Siatka kafelków */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* O mnie */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-light-green mr-3">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-dark-green">
                  Jak wygląda pierwsza wizyta?
                </h3>
              </div>
              <div className="text-gray-600 leading-relaxed flex-grow flex flex-col">
                <div className="flex-grow">
                  <p className="mb-3">
                    Pierwsza wizyta to możliwość poznania się i zadania sobie nawzajem ważnych pytań dotyczących problemu.
                  </p>
                  <p className="mb-3">
                    To czas, w którym możemy dokładniej przyjrzeć się tematowi, z którym przychodzisz.
                  </p>
                  <p className="mb-3">
                    Wspólnie mamy wtedy możliwość ustalenia celu, który chcemy osiągnąć.
                  </p>
                  {isFirstVisitExpanded && (
                    <p className="mb-3">
                      Wyjaśniam również, jak widzę możliwość pracy nad tym problemem oraz ile czasu może ona zająć. To również okazja do omówienia zasad współpracy i odpowiadania na wszelkie pytania, które Cię niepokój.
                    </p>
                  )}
                </div>
                <button
                  onClick={toggleFirstVisitExpanded}
                  className="text-dark-green font-medium cursor-pointer hover:text-pastel-blue transition-colors duration-200 text-left"
                >
                  {isFirstVisitExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                </button>
              </div>
            </div>

            {/* Obszary pracy */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-accent-orange mr-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-dark-green">
                  Obszary pracy
                </h3>
              </div>
              <div className="text-gray-600 leading-relaxed flex-grow flex flex-col">
                <div className="flex-grow">
                  <p className="mb-4">
                    Pomoc psychologiczna dzieciom i młodzieży w wieku szkolnym, pomoc dorosłym.
                  </p>
                  <p className="mb-4">
                    Trudności emocjonalne, takie jak niskie poczucie własnej wartości, nieśmiałość, agresja.
                  </p>
                  <p className="mb-4">
                    Stany depresyjne, lęki, fobie, zaburzenia snu, nadmierny stres.
                  </p>
                  {isAreasExpanded && (
                    <>
                      <p className="mb-4">
                        Problemy w rodzinie, w relacjach rówieśniczych i szkolnych.
                      </p>
                      <p className="mb-4">
                        Trudności w relacjach rodzice-dzieci, problemy wychowawcze.
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={toggleAreasExpanded}
                  className="text-dark-green font-medium cursor-pointer hover:text-pastel-blue transition-colors duration-200 text-left"
                >
                  {isAreasExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                </button>
              </div>
            </div>

            {/* Choroby/Specjalizacje */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-light-green mr-3">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-dark-green">
                  Specjalizacje
                </h3>
              </div>
              <div className="text-gray-600 leading-relaxed flex-grow flex flex-col">
                <div className="flex-grow">
                  <p className="mb-2">• ADHD</p>
                  <p className="mb-2">• Depresja</p>
                  <p className="mb-2">• Kryzys życiowy</p>
                  <p className="mb-2">• Lęki</p>
                  <p className="mb-2">• Problemy wychowawcze</p>
                  <p className="mb-2">• Bezsenność</p>
                  {isExpanded && (
                    <>
                      <p className="mb-2">• Trudności szkolne</p>
                      <p className="mb-2">• Uzależnienia</p>
                      <p className="mb-2">• Zaburzenia emocjonalne</p>
                      <p className="mb-2">• Zaburzenia koncentracji</p>
                      <p className="mb-2">• Zaburzenia psychiczne</p>
                      <p className="mb-2">• Zmęczenie</p>
                      <p className="mb-2">• Zaburzenia lękowe</p>
                      <p className="mb-2">• Konsultacja online</p>
                    </>
                  )}
                </div>
                <button
                  onClick={toggleExpanded}
                  className="text-dark-green font-medium cursor-pointer hover:text-pastel-blue transition-colors duration-200 text-left"
                >
                  {isExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                </button>
              </div>
            </div>

            {/* Edukacja */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="text-accent-orange mr-3">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-dark-green">
                  Edukacja
                </h3>
              </div>
              <div className="text-gray-600 leading-relaxed">
                <p className="font-medium text-dark-green mb-2">
                  mgr Psycholog
                </p>
                <p className="text-sm">
                  Uczelnia Biznesu i Nauk Stosowanych "Varsovia"
                </p>
              </div>
            </div>

            {/* Znajomość języków */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
               <div className="text-light-green mr-3">
                  <Globe className="w-8 h-8" />
                </div>
               <h3 className="text-lg font-semibold text-dark-green">
                  Znajomość języków
                </h3>
              </div>
              <div className="text-gray-600 leading-relaxed">
                <p className="mb-2">🇵🇱 Polski - język ojczysty</p>
                <p>🇬🇧 Angielski</p>
              </div>
            </div>

            {/* Doświadczenie */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
               <div className="text-accent-orange mr-3">
                  <Brain className="w-8 h-8" />
                </div>
               <h3 className="text-lg font-semibold text-dark-green">
                  Usługi
                </h3>
              </div>
              <div className="text-gray-600 leading-relaxed">
                <div className="mb-2 flex">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Praca z&nbsp;dziećmi od&nbsp;6&nbsp;lat</span>
                </div>
                <div className="mb-2 flex">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Konsultacje indywidualne - dzieci, młodzież i&nbsp;dorośli</span>
                </div>
                <div className="mb-2 flex">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Terapia rodzinna</span>
                </div>
                <div className="flex">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Diagnoza i&nbsp;interwencja kryzysowa</span>
                </div>
                <div className="flex">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Konsultacje online</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;

import React from 'react';
import { GraduationCap, Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="o-mnie" className="py-20 lg:py-28 bg-light-green-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Zdjęcie profilowe - po lewej */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Gradientowa ramka */}
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-pastel-blue via-light-green to-accent-orange p-1 shadow-soft">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src="/images/about-image.webp"
                      alt="mgr Joanna Kubiak - psycholog dziecięcy i młodzieży"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Dekoracyjna ikonka serca */}
                <div className="absolute -bottom-2 -right-2 bg-light-green p-2 rounded-full shadow-lg">
                  <Heart className="w-5 h-5 text-dark-green" />
                </div>
              </div>
            </div>

            {/* Opis - po prawej stronie */}
            <div className="text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-dark-green text-xs font-semibold mb-3 border border-light-green/30">
                <Sparkles className="w-3.5 h-3.5 text-pastel-blue" />
                <span>O mnie & Kwalifikacje zawodowe</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-green mb-6 text-balance">
                Witaj! Jestem Joanna
              </h2>

              <div className="text-lg text-gray-700 leading-relaxed mb-6">
                <p className="mb-4">
                  Jestem psychologiem dzieci i młodzieży, absolwentką Uczelni Biznesu i Nauk Stosowanych „Varsovia" w Warszawie, gdzie ukończyłam studia magisterskie ze specjalizacją w psychoterapii. Posiadam wieloletnie doświadczenie zawodowe zdobyte w placówkach oświatowych, poradniach oraz praktyce prywatnej, które pozwala mi trafnie i z empatią odpowiadać na potrzeby młodych podopiecznych i ich rodziców.
                </p>

                <p className="mb-4">
                  W pracy z dziećmi (od 6. roku życia) i młodzieżą stosuję podejście holistyczne i zindywidualizowane. Łączę techniki terapeutyczne z uważnością na etap rozwojowy młodego człowieka, wspierając w odzyskaniu równowagi psychicznej, poczucia własnej wartości i bezpieczeństwa.
                </p>
              </div>

              {/* Sygnały E-E-A-T – Kwalifikacje i Etyka */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-white shadow-xs">
                  <div className="p-2 rounded-lg bg-light-green/40 text-dark-green flex-shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark-green uppercase tracking-wide">Wykształcenie</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Magister psychologii ze specjalizacją w psychoterapii</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-white shadow-xs">
                  <div className="p-2 rounded-lg bg-pastel-blue/20 text-dark-green flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark-green uppercase tracking-wide">Certyfikowane szkolenia</h4>
                    <p className="text-xs text-gray-600 mt-0.5">DBT, diagnoza zaburzeń osobowości dzieci i młodzieży</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-white shadow-xs sm:col-span-2">
                  <div className="p-2 rounded-lg bg-light-green/40 text-dark-green flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark-green uppercase tracking-wide">Standardy etyczne i poufność</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Praca zgodna z Kodeksem Etyczno-Zawodowym Psychologa. Pełna dyskrecja, tajemnica zawodowa i bezpieczna relacja terapeutyczna.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

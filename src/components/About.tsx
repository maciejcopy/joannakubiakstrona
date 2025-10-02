import React from 'react';
import { Award, Users, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="o-mnie" className="py-16 bg-warm-beige">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Zdjęcie profilowe - po lewej */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Gradientowa ramka */}
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-pastel-blue via-light-green to-accent-orange p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src="/images/about-image.webp"
                      alt="mgr Joanna Kubiak - psycholog dziecięcy"
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
            
            {/* Zdjęcie profilowe */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
            {/* Opis - po prawej stronie */}
            <div className="text-left max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-green mb-6">
                Witaj! Jestem Joanna
              </h2>
              
              <div className="text-lg text-gray-700 leading-relaxed mb-8">
                <p className="mb-4">
                  Jestem psychologiem dzieci i młodzieży, absolwentką Uczelni Biznesu i Nauk Stosowanych „Varsovia" w Warszawie, gdzie ukończyłam studia magisterskie ze specjalizacją w psychoterapii. Posiadam bogate doświadczenie zawodowe zdobyte w różnych placówkach oświatowych i prywatnych, które pozwoliło mi głęboko zrozumieć potrzeby i perspektywy moich młodych podopiecznych.
                </p>
                
                <p>
                  W pracy z dziećmi i młodzieżą stosuję podejście holistyczne, łącząc techniki terapeutyczne z elastycznością dydaktyczną, co umożliwia mi skuteczną pomoc w odzyskaniu równowagi psychicznej i poczucia zadowolenia z życia. Swoje podejście do terapii stale aktualizuję poprzez liczne szkolenia, takie jak „Wykorzystanie techniki DBT w leczeniu zaburzeń borderline", „Zaburzenia osobowości u dzieci i młodzieży – proces diagnostyczny i prowadzenie terapii" oraz „Skuteczne metody i podejścia terapeutyczne".
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
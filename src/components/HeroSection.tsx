import React from 'react';

const HeroSection: React.FC = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('kontakt');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="strona-glowna" className="bg-warm-beige py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left side - text content - full width on mobile */}
            <div className="space-y-6 lg:order-1 w-full">
              <div className="mb-6">
                <h1 className="font-bold text-dark-green leading-tight mb-6">
                  <span className="text-2xl lg:text-3xl block">Nazywam się</span>
                  <span className="text-4xl lg:text-6xl text-pastel-blue">Joanna Kubiak</span>
                </h1>
              </div>

              {/* Lista punktów */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-yellow rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Wspieram w trudnościach emocjonalnych i stanach lękowych.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-yellow rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Pomagam w budowaniu relacji rodzinnych i rówieśniczych.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-yellow rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Towarzyszę rodzicom w rozwiązywaniu problemów wychowawczych.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-yellow rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Łączę empatię z nowoczesnymi metodami terapeutycznymi.
                  </p>
                </div>
              </div>

              {/* Przycisk CTA */}
              <button 
                onClick={scrollToContact}
                className="bg-pastel-blue text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-pastel-blue-hover transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                UMÓW KONSULTACJĘ
              </button>
            </div>
            
            {/* Right side - image - hidden on mobile, visible on desktop */}
            <div className="hidden lg:flex justify-center lg:justify-end lg:order-2">
              <div className="relative">
                <div className="w-80 h-96 lg:w-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero-image.webp"
                    alt="Joanna Kubiak - psycholog"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Dekoracyjne elementy */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-light-green rounded-full opacity-60"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-accent-orange rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
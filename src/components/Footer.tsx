import React from 'react';
import { Phone, Mail, MapPin, Heart, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-green text-light-green/90 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Główna zawartość stopki */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            {/* Informacje o psychologu */}
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white/10 p-2 rounded-lg mr-3">
                  <Heart className="w-6 h-6 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">mgr Joanna Kubiak</h3>
                  <p className="text-light-green/80">psycholog dziecięcy i młodzieży</p>
                </div>
              </div>
              <p className="text-light-green/80 leading-relaxed">
                Profesjonalna pomoc psychologiczna dla dzieci, młodzieży i rodzin. 
                Tworzymy razem bezpieczną przestrzeń dla rozwoju emocjonalnego.
              </p>
            </div>

            {/* Dane kontaktowe */}
            <div>
             <h4 className="text-lg font-semibold mb-4 text-white">Kontakt</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                 <Phone className="w-5 h-5 text-accent-yellow mr-3" />
                  <span className="text-light-green/80">+48 729 933 833</span>
                </div>
                
                <div className="flex items-center">
                 <Mail className="w-5 h-5 text-accent-yellow mr-3" />
                  <span className="text-light-green/80">kontakt@joannakubiakpsycholog.pl</span>
                </div>
                
                <div className="flex items-center">
                 <MapPin className="w-5 h-5 text-accent-yellow mr-3" />
                  <span className="text-light-green/80">Konsultacje online i stacjonarne</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <a href="https://www.facebook.com/profile.php?id=61584924865771" target="_blank" rel="noopener noreferrer" aria-label="Facebook - Joanna Kubiak" className="text-light-green/80 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/joannakubiak_psycholog/" target="_blank" rel="noopener noreferrer" aria-label="Instagram - Joanna Kubiak" className="text-light-green/80 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Dolna część stopki */}
          <div className="border-t border-white/15 pt-6">
            <div className="text-center">
              <p className="text-light-green/80 text-sm">
                © 2024 mgr Joanna Kubiak. Wszystkie prawa zastrzeżone.
              </p>
              <p className="text-light-green/60 text-xs mt-2 inline-flex items-center justify-center gap-1">
                <span>Strona wykonana z</span>
                <Heart className="w-3.5 h-3.5 text-accent-orange fill-accent-orange" />
                <span>dla dzieci i rodzin</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-warm-beige text-gray-700 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Główna zawartość stopki */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            {/* Informacje o psychologu */}
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                  <Heart className="w-6 h-6 text-light-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-green">mgr Joanna Kubiak</h3>
                  <p className="text-gray-600">psycholog dziecięcy i młodzieży</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Profesjonalna pomoc psychologiczna dla dzieci, młodzieży i rodzin. 
                Tworzymy razem bezpieczną przestrzeń dla rozwoju emocjonalnego.
              </p>
            </div>

            {/* Dane kontaktowe */}
            <div>
             <h4 className="text-lg font-semibold mb-4 text-dark-green">Kontakt</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                 <Phone className="w-5 h-5 text-light-green mr-3" />
                  <span className="text-gray-600">+48 729 933 833</span>
                </div>
                
                <div className="flex items-center">
                 <Mail className="w-5 h-5 text-light-green mr-3" />
                  <span className="text-gray-600">kontakt@joannakubiakpsycholog.pl</span>
                </div>
                
                <div className="flex items-center">
                 <MapPin className="w-5 h-5 text-light-green mr-3" />
                  <span className="text-gray-600">Konsultacje online i stacjonarne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dolna część stopki */}
          <div className="border-t border-amber-200 pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                © 2024 mgr Joanna Kubiak. Wszystkie prawa zastrzeżone.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Strona wykonana z ❤️ dla dzieci i rodzin
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
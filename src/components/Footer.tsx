import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart, Facebook, Instagram, Building2 } from 'lucide-react';
import { COMPANY_INFO } from '../config/companyInfo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-green text-light-green/90 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Główna zawartość stopki: 3 kolumny */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            {/* 1. Informacje o psychologu */}
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white/10 p-2 rounded-lg mr-3">
                  <Heart className="w-6 h-6 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{COMPANY_INFO.ownerName}</h3>
                  <p className="text-light-green/80 text-sm">psycholog dziecięcy i młodzieży</p>
                </div>
              </div>
              <p className="text-light-green/80 text-sm leading-relaxed">
                Profesjonalna pomoc psychologiczna dla dzieci, młodzieży i rodzin. 
                Tworzymy razem bezpieczną przestrzeń dla rozwoju emocjonalnego.
              </p>
            </div>

            {/* 2. Dane rejestrowe firmy */}
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white/10 p-2 rounded-lg mr-3">
                  <Building2 className="w-5 h-5 text-accent-yellow" />
                </div>
                <h4 className="text-lg font-semibold text-white">Dane firmy</h4>
              </div>
              <div className="space-y-2 text-sm text-light-green/80">
                <p className="font-medium text-white">{COMPANY_INFO.companyName}</p>
                <p>NIP: <span className="text-white font-mono">{COMPANY_INFO.nip}</span></p>
                <p>REGON: <span className="text-white font-mono">{COMPANY_INFO.regon}</span></p>
                <p className="pt-1">
                  {COMPANY_INFO.address.street}, {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}
                </p>
              </div>
            </div>

            {/* 3. Dane kontaktowe */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Kontakt</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-accent-yellow mr-3 shrink-0" />
                  <a href={`tel:${COMPANY_INFO.phone.replace(/\s+/g, '')}`} className="text-light-green/80 hover:text-white transition-colors">
                    {COMPANY_INFO.phone}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-accent-yellow mr-3 shrink-0" />
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-light-green/80 hover:text-white transition-colors">
                    {COMPANY_INFO.email}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-accent-yellow mr-3 shrink-0" />
                  <span className="text-light-green/80">Konsultacje online i stacjonarne</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <a 
                  href="https://www.facebook.com/profile.php?id=61584924865771" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook - Joanna Kubiak" 
                  className="text-light-green/80 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/joannakubiak_psycholog/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram - Joanna Kubiak" 
                  className="text-light-green/80 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Dolna część stopki: Linki prawne i prawa autorskie */}
          <div className="border-t border-white/15 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              {/* Linki do dokumentów prawnych */}
              <div className="flex items-center gap-6 text-light-green/90">
                <Link 
                  to="/regulamin" 
                  className="hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  Regulamin serwisu
                </Link>
                <span className="text-white/25">•</span>
                <Link 
                  to="/polityka-prywatnosci" 
                  className="hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  Polityka prywatności
                </Link>
              </div>

              {/* Prawa autorskie */}
              <p className="text-light-green/70 text-center sm:text-right">
                © {new Date().getFullYear()} {COMPANY_INFO.ownerName}. Wszystkie prawa zastrzeżone.
              </p>
            </div>

            <div className="text-center mt-6">
              <p className="text-light-green/50 text-[11px] inline-flex items-center justify-center gap-1">
                <span>Strona wykonana z</span>
                <Heart className="w-3 h-3 text-accent-orange fill-accent-orange" />
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

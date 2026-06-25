import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Wifi, Calendar, ArrowRight } from 'lucide-react';

const Contact: React.FC = () => {
  const locations = [
    { name: 'Przychodnia Multi-Medic', address: 'Cieszkowskiego 100/102, Swarzędz' },
    { name: 'Med+ Centrum Medyczne', address: 'Poznań' },
    { name: 'Centrum Zdrowia AGVITA', address: 'ul. Promienista 6, Poznań' },
  ];

  const pricingItems = [
    { label: 'Konsultacja indywidualna', duration: '50 min', price: '200 zł' },
    { label: 'Konsultacja online', duration: '50 min', price: '200 zł' },
  ];

  return (
    <section id="kontakt" className="py-20 lg:py-28 bg-light-green-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-green mb-4 text-balance">
            Cennik i lokalizacje
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Przyjmuję w trzech gabinetach w Poznaniu i Swarzędzu oraz online
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Cennik */}
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-xl font-bold text-dark-green mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-yellow inline-block" />
              Cennik
            </h3>
            <div className="space-y-4">
              {pricingItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-dark-green">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.duration}</p>
                  </div>
                  <span className="text-xl font-bold text-pastel-blue">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-light-green-bg rounded-xl">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-dark-green flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Dostępne wizyty <span className="font-semibold text-dark-green">stacjonarne i online</span>
                </p>
              </div>
            </div>
          </div>

          {/* Lokalizacje */}
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-xl font-bold text-dark-green mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pastel-blue inline-block" />
              Gabinety
            </h3>
            <div className="space-y-5">
              {locations.map((loc, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-light-green p-2 rounded-lg flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-dark-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-green text-sm">{loc.name}</p>
                    <p className="text-gray-500 text-sm">{loc.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kontakt */}
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-xl font-bold text-dark-green mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-orange inline-block" />
              Kontakt bezpośredni
            </h3>
            <div className="space-y-5">
              <a href="tel:+48729933833" className="flex items-center gap-4 group">
                <div className="bg-light-green p-3 rounded-full group-hover:bg-pastel-blue/10 transition-colors">
                  <Phone className="w-5 h-5 text-dark-green" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Telefon</p>
                  <p className="font-semibold text-dark-green group-hover:text-pastel-blue transition-colors">
                    +48 729 933 833
                  </p>
                </div>
              </a>

              <a href="mailto:kontakt@joannakubiakpsycholog.pl" className="flex items-center gap-4 group">
                <div className="bg-light-green p-3 rounded-full group-hover:bg-pastel-blue/10 transition-colors">
                  <Mail className="w-5 h-5 text-dark-green" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                  <p className="font-semibold text-dark-green text-sm group-hover:text-pastel-blue transition-colors">
                    kontakt@joannakubiakpsycholog.pl
                  </p>
                </div>
              </a>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Wolisz najpierw napisać?{' '}
                <Link to="/kontakt" className="text-pastel-blue hover:underline font-medium">
                  Skorzystaj z formularza kontaktowego
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Główny baner CTA */}
        <div className="relative overflow-hidden bg-dark-green rounded-3xl px-8 py-14 text-center shadow-soft">
          {/* Dekoracyjne kółka w tle */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-4 right-16 w-16 h-16 rounded-full bg-accent-yellow/20 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 text-light-green text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <Calendar className="w-4 h-4" />
              Rezerwacja online – szybko i wygodnie
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-balance font-serif">
              Zrób pierwszy krok — zarezerwuj wizytę już dziś
            </h2>
            <p className="text-light-green/80 mb-8 text-base max-w-lg mx-auto">
              Wybierz dogodny termin w naszym kalendarzu online. Zajmie Ci to tylko 2 minuty.
            </p>
            <Link
              to="/rezerwacja"
              state={{ from: '/' }}
              className="inline-flex items-center gap-2 bg-pastel-blue text-white px-9 py-4 rounded-full font-semibold text-lg hover:bg-pastel-blue-hover transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              Sprawdź wolne terminy
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;

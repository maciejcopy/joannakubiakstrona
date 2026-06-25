import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Send, Wifi, ChevronRight } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setError('Formularz nie jest jeszcze skonfigurowany. Skontaktuj się bezpośrednio: kontakt@joannakubiakpsycholog.pl');
      setIsLoading(false);
      return;
    }

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 5000);
      } else {
        const detailsStr = result.details
          ? (typeof result.details === 'object' ? JSON.stringify(result.details) : result.details)
          : '';
        setError(detailsStr ? `Błąd: ${detailsStr}` : (result.error || `Błąd ${response.status}`));
      }
    } catch (err: any) {
      setError(`Błąd sieci: ${err.message}. Sprawdź połączenie internetowe.`);
    } finally {
      setIsLoading(false);
    }
  };

  const locations = [
    {
      name: 'Przychodnia Lekarska Multi-Medic',
      address: 'Cieszkowskiego 100/102, Swarzędz',
      mapsUrl: 'https://maps.google.com/?q=Cieszkowskiego+100/102+Swarzedz',
    },
    {
      name: 'Med+ Centrum Medyczne Poznań',
      address: 'Poznań',
      mapsUrl: 'https://maps.google.com/?q=Med+Centrum+Medyczne+Poznan',
    },
    {
      name: 'Centrum Zdrowia AGVITA',
      address: 'ul. Promienista 6, Poznań',
      mapsUrl: 'https://maps.google.com/?q=Promienista+6+Poznan',
    },
  ];

  const faqs = [
    {
      q: 'Jak przygotować się do pierwszej wizyty?',
      a: 'Nie potrzebujesz żadnych specjalnych przygotowań. Warto przemyśleć, co Cię do mnie sprowadza i jakie cele chciałbyś osiągnąć – ale to możemy ustalić również podczas spotkania.',
    },
    {
      q: 'Czy na pierwszej wizycie musi być dziecko?',
      a: 'Pierwsza konsultacja może odbyć się wyłącznie z rodzicem/opiekunem. Omówimy wtedy sytuację i ustalimy najlepszy plan dalszej pracy.',
    },
    {
      q: 'Czy możliwe są konsultacje online?',
      a: 'Tak, prowadzę konsultacje online za pomocą platformy wideokonferencyjnej. Jest to wygodna alternatywa, jeśli dojazd do gabinetu jest utrudniony.',
    },
    {
      q: 'Jak długo trwa sesja i ile kosztuje?',
      a: 'Standardowa konsultacja trwa 50 minut i kosztuje 200 zł. Płatność gotówką lub przelewem.',
    },
  ];

  return (
    <div className="min-h-screen bg-warm-beige">
      <TopBar />
      <Header />

      {/* Hero mini */}
      <section className="bg-dark-green py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif mb-3">Kontakt</h1>
          <p className="text-light-green text-lg max-w-xl mx-auto">
            Masz pytania przed rezerwacją? Napisz do mnie lub zadzwoń.
          </p>
          <div className="mt-6">
            <Link
              to="/rezerwacja"
              className="inline-flex items-center gap-2 bg-pastel-blue text-white px-7 py-3 rounded-full font-semibold hover:bg-pastel-blue-hover transition-all duration-300 shadow-soft"
            >
              Wolisz od razu zarezerwować wizytę?
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left column – contact info + locations + FAQ */}
          <div className="lg:col-span-2 space-y-8">

            {/* Dane kontaktowe */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-xl font-bold text-dark-green mb-6">Dane kontaktowe</h2>
              <div className="space-y-5">
                <a
                  href="tel:+48729933833"
                  className="flex items-center space-x-4 group"
                >
                  <div className="bg-light-green p-3 rounded-full flex-shrink-0 group-hover:bg-pastel-blue/10 transition-colors">
                    <Phone className="w-5 h-5 text-dark-green" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Telefon</p>
                    <p className="font-semibold text-dark-green group-hover:text-pastel-blue transition-colors">+48 729 933 833</p>
                  </div>
                </a>

                <a
                  href="mailto:kontakt@joannakubiakpsycholog.pl"
                  className="flex items-center space-x-4 group"
                >
                  <div className="bg-light-green p-3 rounded-full flex-shrink-0 group-hover:bg-pastel-blue/10 transition-colors">
                    <Mail className="w-5 h-5 text-dark-green" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                    <p className="font-semibold text-dark-green text-sm group-hover:text-pastel-blue transition-colors">kontakt@joannakubiakpsycholog.pl</p>
                  </div>
                </a>

                <div className="flex items-center space-x-4">
                  <div className="bg-light-green p-3 rounded-full flex-shrink-0">
                    <Wifi className="w-5 h-5 text-dark-green" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Forma</p>
                    <p className="font-semibold text-dark-green">Stacjonarnie & Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lokalizacje */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-xl font-bold text-dark-green mb-6">Lokalizacje gabinetów</h2>
              <div className="space-y-5">
                {locations.map((loc, i) => (
                  <a
                    key={i}
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-4 group"
                  >
                    <div className="bg-light-green p-3 rounded-full flex-shrink-0 mt-0.5 group-hover:bg-pastel-blue/10 transition-colors">
                      <MapPin className="w-5 h-5 text-dark-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark-green text-sm group-hover:text-pastel-blue transition-colors">{loc.name}</p>
                      <p className="text-gray-500 text-sm">{loc.address}</p>
                      <p className="text-xs text-pastel-blue mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Otwórz w Mapach →</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right column – form + FAQ */}
          <div className="lg:col-span-3 space-y-8">

            {/* Formularz */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              {!isSubmitted ? (
                <>
                  <h2 className="text-xl font-bold text-dark-green mb-2">Napisz wiadomość</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Odpowiadam na wiadomości w ciągu 1 dnia roboczego.
                    Jeśli wolisz od razu zarezerwować wizytę,{' '}
                    <Link to="/rezerwacja" className="text-pastel-blue hover:underline font-medium">
                      skorzystaj z kalendarza online
                    </Link>.
                  </p>

                  {error && (
                    <div className="bg-error-bg border border-error/30 text-error px-4 py-3 rounded-lg mb-6 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-dark-green mb-1.5">
                        Imię i nazwisko
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue focus:border-transparent transition-colors bg-gray-50/50"
                        placeholder="Twoje imię i nazwisko"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-dark-green mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue focus:border-transparent transition-colors bg-gray-50/50"
                          placeholder="twoj@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-dark-green mb-1.5">
                          Telefon <span className="text-gray-400 font-normal">(opcjonalnie)</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue focus:border-transparent transition-colors bg-gray-50/50"
                          placeholder="+48 123 456 789"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-dark-green mb-1.5">
                        Wiadomość
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue focus:border-transparent transition-colors resize-none bg-gray-50/50"
                        placeholder="Opisz swoją sytuację lub zadaj pytanie..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-pastel-blue text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-pastel-blue-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Wysyłanie...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Wyślij wiadomość</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-light-green p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Send className="w-8 h-8 text-dark-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark-green mb-2">Dziękuję za wiadomość!</h3>
                  <p className="text-gray-600">Odpowiem w ciągu 24 godzin.</p>
                </div>
              )}
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-xl font-bold text-dark-green mb-6">Najczęściej zadawane pytania</h2>
              <div className="space-y-5">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                    <p className="font-semibold text-dark-green mb-1.5">{faq.q}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;

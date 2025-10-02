import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setError('Formularz nie jest jeszcze skonfigurowany. Skontaktuj się bezpośrednio: kontakt@joannakubiakpsycholog.pl');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 5000);
      } else {
        setError(result.error || 'Wystąpił błąd podczas wysyłania wiadomości');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="kontakt" className="py-20 bg-warm-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-green mb-4">Kontakt</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Skontaktuj się ze mną, aby umówić konsultację lub zadać pytania
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-dark-green mb-6">Dane kontaktowe</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-light-green p-3 rounded-full">
                    <Phone className="w-6 h-6 text-dark-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-green">Telefon</p>
                    <p className="text-gray-600">+48 729 933 833</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-light-green p-3 rounded-full">
                    <Mail className="w-6 h-6 text-dark-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-green">Email</p>
                    <p className="text-gray-600 text-sm sm:text-base">kontakt@joannakubiakpsycholog.pl</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-dark-green mb-6">Lokalizacja</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-light-green p-3 rounded-full flex-shrink-0">
                    <MapPin className="w-6 h-6 text-dark-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-green">Adres 1</p>
                    <p className="text-gray-600">Przychodnia Lekarska Multi-Medic</p>
                    <p className="text-gray-600">Cieszkowskiego 100/102, Swarzędz</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-light-green p-3 rounded-full flex-shrink-0">
                    <MapPin className="w-6 h-6 text-dark-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-green">Adres 2</p>
                    <p className="text-gray-600">Med+ Centrum Medyczne Poznań</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-dark-green mb-4">Godziny pracy</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Poniedziałek - Piątek</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sobota</span>
                  <span>10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Niedziela</span>
                  <span>Zamknięte</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {!isSubmitted ? (
              <>
                <h3 className="text-2xl font-bold text-dark-green mb-6">Napisz do mnie</h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark-green mb-2">
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green focus:border-transparent transition-colors"
                      placeholder="Twoje imię i nazwisko"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark-green mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green focus:border-transparent transition-colors"
                      placeholder="twoj@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-dark-green mb-2">
                      Telefon (opcjonalnie)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green focus:border-transparent transition-colors"
                      placeholder="+48 123 456 789"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-dark-green mb-2">
                      Wiadomość
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green focus:border-transparent transition-colors resize-none"
                      placeholder="Opisz swoją sytuację lub zadaj pytanie..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-pastel-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-pastel-blue-hover transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Wysyłanie...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
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
                <p className="text-gray-600">
                  Wiadomość została wysłana pomyślnie. Odpowiem w ciągu 24 godzin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { UserPlus, LogIn, Calendar, X } from 'lucide-react';
import { LandingPage } from '../LandingPage';
import { PacjentDashboard } from '../panel/pacjent/PacjentDashboard';

interface VisitType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
}

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Dane pacjenta
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+48');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from || '/';
  const showDashboardBg = fromPath.includes('/panel/pacjent/dashboard');

  // Sprawdzenie sesji i autoryzacji
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    });
  }, []);

  // Pobranie danych profilu w celu automatycznego uzupełnienia formularza
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          setEmail(user.email || '');
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone_prefix, phone_number')
            .eq('auth_id', user.id)
            .single();
          
          if (profile) {
            setFullName(profile.full_name || '');
            if (profile.phone_prefix) setPhonePrefix(profile.phone_prefix);
            if (profile.phone_number) setPhoneNumber(profile.phone_number);
          }
        }
      } catch (err) {
        console.error('Error prefilling user data in BookingWizard:', err);
      }
    }
    fetchUserData();
  }, [isAuthenticated]);

  // Pobranie dostępnych typów wizyt
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchVisitTypes() {
      try {
        const { data, error } = await supabase
          .from('visit_types')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setVisitTypes(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisitTypes();
  }, [isAuthenticated]);

  const handleSelectService = (service: VisitType) => {
    setSelectedVisitType(service);
    setStep(2);
  };

  const handleSelectDateTime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logika rezerwacji
    toast.success('Rezerwacja wysłana! Szczegółowa logika rezerwacji zostanie dołączona w kolejnych etapach.');
    navigate(fromPath);
  };

  // Stan inicjalnego sprawdzania autoryzacji
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-light-green-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-light-green/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-dark-green animate-spin"></div>
          </div>
          <p className="text-xs font-semibold text-dark-green/70 animate-pulse font-serif">Inicjalizacja...</p>
        </div>
      </div>
    );
  }

  // Niezalogowany – ekran zachęty do rejestracji z rozmazaną stroną główną w tle
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        {/* Zamazane tło */}
        <div className="filter blur-sm md:blur-md pointer-events-none select-none fixed inset-0 z-0 overflow-hidden opacity-50 scale-[1.02]">
          <LandingPage />
        </div>

        {/* Modal nakładka */}
        <div className="relative z-10 min-h-screen bg-black/15 backdrop-blur-[3px] flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full animate-slide-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-light-green/30 overflow-hidden">
              {/* Nagłówek */}
              <div className="bg-dark-green px-8 py-8 text-center relative">
                <Link 
                  to={fromPath} 
                  className="absolute top-4 right-4 text-light-green/75 hover:text-white transition duration-300"
                  aria-label="Zamknij"
                >
                  <X className="w-5 h-5" />
                </Link>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-white mb-2">Rezerwacja wizyty</h1>
                <p className="text-[#C4DEBE] text-sm font-medium">
                  Wymagane zalogowanie
                </p>
              </div>

              {/* Treść */}
              <div className="px-8 py-8">
                <p className="text-gray-600 text-sm text-center mb-8 leading-relaxed">
                  Aby zarezerwować wizytę online, potrzebujesz konta pacjenta. Pozwoli Ci ono zarządzać terminami oraz bezpiecznie kontaktować się z gabinetem.
                </p>

                <div className="space-y-3">
                  <Link
                    to="/auth/register"
                    state={{ returnTo: '/panel/pacjent/dashboard?tab=rezerwacja' }}
                    className="flex items-center justify-center gap-3 w-full bg-pastel-blue hover:bg-pastel-blue-hover text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-soft hover:-translate-y-0.5 transform"
                  >
                    <UserPlus className="w-5 h-5" />
                    Zarejestruj się i zarezerwuj wizytę
                  </Link>

                  <Link
                    to="/auth/login"
                    state={{ returnTo: '/panel/pacjent/dashboard?tab=rezerwacja' }}
                    className="flex items-center justify-center gap-3 w-full bg-white border-2 border-light-green hover:border-dark-green text-dark-green py-4 px-6 rounded-xl font-semibold transition-all duration-300"
                  >
                    <LogIn className="w-5 h-5" />
                    Mam już konto – zaloguj się
                  </Link>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <Link to={fromPath} className="text-sm text-gray-400 hover:text-dark-green transition-colors">
                    ← Anuluj i wróć
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Zalogowany – Kreator w oknie modalnym nad zamazanym tłem (LandingPage lub PacjentDashboard)
  return (
    <div className="relative min-h-screen">
      {/* Zamazane tło */}
      <div className="filter blur-sm md:blur-md pointer-events-none select-none fixed inset-0 z-0 overflow-hidden opacity-50 scale-[1.02]">
        {showDashboardBg ? <PacjentDashboard /> : <LandingPage />}
      </div>

      {/* Modal nakładka */}
      <div className="relative z-10 min-h-screen bg-black/15 backdrop-blur-[3px] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-light-green/35 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-dark-green text-white px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold">Kreator Rezerwacji Wizyty</h1>
              <p className="text-sm text-light-green/80 font-medium">Wygodnie zarezerwuj termin sesji psychologicznej</p>
            </div>
            <Link to={fromPath} className="text-sm text-light-green hover:text-white transition duration-300 flex items-center gap-1.5 font-semibold bg-white/10 px-3 py-1.5 rounded-full">
              <X className="w-4 h-4" />
              <span>Zamknij</span>
            </Link>
          </div>

          {/* Multi-step progress bar */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <div className={`flex-1 text-center py-4 text-xs font-semibold ${step === 1 ? 'text-dark-green border-b-2 border-dark-green' : 'text-gray-400'}`}>
              1. Wybór usługi
            </div>
            <div className={`flex-1 text-center py-4 text-xs font-semibold ${step === 2 ? 'text-dark-green border-b-2 border-dark-green' : 'text-gray-400'}`}>
              2. Wybór terminu
            </div>
            <div className={`flex-1 text-center py-4 text-xs font-semibold ${step === 3 ? 'text-dark-green border-b-2 border-dark-green' : 'text-gray-400'}`}>
              3. Dane i podsumowanie
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-dark-green mb-6">Jakiej pomocy potrzebujesz?</h2>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-4 border-light-green/30"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-dark-green animate-spin"></div>
                    </div>
                    <p className="text-xs font-semibold text-dark-green/70 animate-pulse font-serif">Wczytywanie usług...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visitTypes.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleSelectService(service)}
                        className="border border-gray-200 hover:border-dark-green hover:bg-light-green-bg/30 rounded-2xl p-6 cursor-pointer transition duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="font-serif font-bold text-lg text-dark-green mb-2">{service.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{service.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                          <span className="text-xs text-gray-500">Czas: {service.duration} min</span>
                          <span className="font-serif font-bold text-pastel-blue">{service.price} zł</span>
                        </div>
                      </div>
                    ))}
                    {visitTypes.length === 0 && (
                      <p className="text-gray-500 col-span-2 text-center py-12">Brak zdefiniowanych aktywnych usług.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-dark-green mb-6">Wybierz dogodny termin</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Wybrana usługa: <strong className="text-dark-green">{selectedVisitType?.title}</strong>
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-sm text-gray-500 mb-4">Wybierz przykładowy termin testowy:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleSelectDateTime('2026-06-15', '09:00')}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-dark-green hover:bg-light-green-bg/50 transition duration-300 text-sm font-medium text-dark-green"
                    >
                      15 Czerwca (Poniedziałek), 09:00
                    </button>
                    <button
                      onClick={() => handleSelectDateTime('2026-06-15', '11:30')}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-dark-green hover:bg-light-green-bg/50 transition duration-300 text-sm font-medium text-dark-green"
                    >
                      15 Czerwca (Poniedziałek), 11:30
                    </button>
                    <button
                      onClick={() => handleSelectDateTime('2026-06-16', '14:00')}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-dark-green hover:bg-light-green-bg/50 transition duration-300 text-sm font-medium text-dark-green"
                    >
                      16 Czerwca (Wtorek), 14:00
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                  >
                    Wstecz
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmitBooking}>
                <h2 className="text-xl font-serif font-bold text-dark-green mb-6">Uzupełnij swoje dane kontaktowe</h2>
                
                <div className="bg-light-green-bg/50 border border-light-green/35 rounded-2xl p-6 mb-6">
                  <h3 className="font-serif font-bold text-dark-green mb-2 text-sm">Podsumowanie wyboru:</h3>
                  <ul className="text-sm space-y-1.5 text-gray-700">
                    <li>Usługa: <strong>{selectedVisitType?.title}</strong> ({selectedVisitType?.price} zł)</li>
                    <li>Termin: <strong>{selectedDate} o godzinie {selectedTime}</strong></li>
                  </ul>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label htmlFor="fullname-input" className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
                    <input
                      id="fullname-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email-input" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700">Numer telefonu</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                        className="w-20 px-3 py-2.5 border border-gray-300 rounded-xl text-center sm:text-sm"
                      />
                      <input
                        id="phone-input"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-dark-green sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                  >
                    Wstecz
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-dark-green hover:bg-dark-green/90 transition duration-300 shadow-soft"
                  >
                    Potwierdź rezerwację
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { UserPlus, LogIn, Calendar, X, CheckCircle } from 'lucide-react';
import { LandingPage } from '../LandingPage';
import { PacjentDashboard } from '../panel/pacjent/PacjentDashboard';
import Cal, { getCalApi } from "@calcom/embed-react";

interface VisitType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  cal_slug?: string;
}

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(null);
  
  // Dane pacjenta
  const [profileId, setProfileId] = useState('');
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

  // Prefill profile data and initialize Cal.com Embed API
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
            .select('id, full_name, phone_prefix, phone_number')
            .eq('auth_id', user.id)
            .single();
          
          if (profile) {
            setProfileId(profile.id);
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

  // Initialize Cal.com and setup event listeners
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi();
        cal("ui", {
          theme: "light",
          styles: { branding: { brandColor: "#2F5C3A" } },
          hideEventTypeDetails: true,
          layout: "month_view"
        });
        
        // Register booking successful listener
        cal("on", {
          action: "bookingSuccessfulV2",
          callback: (e: { detail: { data: unknown } }) => {
            console.log("Cal.com booking success event:", e.detail);
            toast.success("Wizyta została pomyślnie zarezerwowana!");
            setStep(3); // Go to success confirmation screen
          }
        });
      } catch (err) {
        console.error("Failed to initialize Cal.com SDK:", err);
      }
    })();
  }, []);

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
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Lewa kolumna: Kalendarz Cal.com */}
                <div className="lg:col-span-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
                  <h2 className="text-xl font-serif font-bold text-dark-green mb-4 px-2">Wybierz dogodny termin</h2>
                  <Cal
                    calLink={`joanna-kubiak-0ojprl/${selectedVisitType?.cal_slug || 'konsultacja-indywidualna'}?metadata[userId]=${profileId}&metadata[visitTypeId]=${selectedVisitType?.id}`}
                    style={{ width: "100%", height: "550px", overflow: "scroll" }}
                    config={{
                      name: fullName,
                      email: email,
                      phone: `${phonePrefix}${phoneNumber}`,
                      theme: "light",
                      "metadata[userId]": profileId,
                      "metadata[visitTypeId]": selectedVisitType?.id
                    }}
                  />
                  <div className="mt-4 px-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Wstecz
                    </button>
                  </div>
                </div>

                {/* Prawa kolumna: Informacje o specjaliście i usłudze */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Zdjęcie i krótki opis */}
                  <div className="bg-[#FBF4E8] rounded-3xl p-6 border border-[#E8DFC9]/40 text-center">
                    <img
                      src="/zdjęcia/joanna_kubiak.jpg"
                      alt="mgr Joanna Kubiak"
                      onError={(e) => {
                        // Fallback w razie gdyby ścieżka do zdjęcia była inna
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop";
                      }}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-soft mb-4"
                    />
                    <h3 className="font-serif font-bold text-lg text-dark-green">mgr Joanna Kubiak</h3>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Psycholog dziecięcy i młodzieży</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Konsultacja odbywa się w bezpiecznej, wspierającej atmosferze. Zapraszam do wyboru dogodnego terminu w kalendarzu obok.
                    </p>
                  </div>

                  {/* Szczegóły usługi */}
                  <div className="bg-[#2F5C3A] rounded-3xl p-6 text-white shadow-soft">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full">Szczegóły usługi</span>
                    <h4 className="font-serif font-bold text-xl mt-3 mb-2">{selectedVisitType?.title}</h4>
                    <p className="text-sm text-[#C4DEBE] line-clamp-3 mb-4">{selectedVisitType?.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10 text-sm font-semibold">
                      <span>Czas: {selectedVisitType?.duration} min</span>
                      <span className="text-lg font-serif font-bold">{selectedVisitType?.price} zł</span>
                    </div>
                  </div>

                  {/* Informacja o Stripe / płatnościach */}
                  <div className="bg-[#F6FAF4] rounded-3xl p-6 border border-[#C4DEBE]/35 text-sm text-gray-600 space-y-2">
                    <div className="flex gap-2 items-start">
                      <span className="p-1 bg-[#C4DEBE]/40 text-[#2F5C3A] rounded-lg mt-0.5">💡</span>
                      <p>Wizytę można zarezerwować od razu. Płatność za sesję odbędzie się na miejscu w gabinecie lub przelewem.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-12 px-4 max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F6FAF4] text-[#2F5C3A] rounded-full mb-6 border-2 border-[#C4DEBE]">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-dark-green mb-4">Rezerwacja zakończona!</h2>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                  Twoja wizyta na usługę <strong>{selectedVisitType?.title}</strong> została pomyślnie zapisana. Joanna otrzymała powiadomienie o nowej rezerwacji. Szczegóły oraz link do spotkania online (jeśli dotyczy) znajdziesz w swoim panelu pacjenta.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/panel/pacjent/dashboard')}
                    className="w-full bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 shadow-soft"
                  >
                    Przejdź do panelu pacjenta
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition duration-300"
                  >
                    Wróć do strony głównej
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

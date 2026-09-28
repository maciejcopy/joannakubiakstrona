import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { UserPlus, LogIn, Calendar, X, Clock, ShieldCheck } from 'lucide-react';
import { LandingPage } from '../LandingPage';
import { PacjentDashboard } from '../panel/pacjent/PacjentDashboard';
import { SEO } from '../../components/SEO';
import { getBreadcrumbSchema } from '../../config/schemaData';
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
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;
  const initialBooking = locationState?.booking;
  const initialStep = locationState?.step ? Number(locationState.step) : 1;
  const fromPath = locationState?.from || '/';
  const showDashboardBg = fromPath.includes('/panel/pacjent/dashboard');

  const [step, setStep] = useState(initialStep);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(initialBooking?.visit_type || null);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsWarning, setTermsWarning] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{ id?: string; uid?: string; date?: string } | null>(
    initialBooking ? { id: initialBooking.id, uid: initialBooking.uid, date: initialBooking.date } : null
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  
  // Dane pacjenta
  const [profileId, setProfileId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+48');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Reaguj na zmiany stanu nawigacji (np. ponowne kliknięcie opłacenia z panelu pacjenta)
  useEffect(() => {
    if (locationState?.step) {
      setStep(Number(locationState.step));
    }
    if (locationState?.booking) {
      setPendingBooking({
        id: locationState.booking.id,
        uid: locationState.booking.uid,
        date: locationState.booking.date,
      });
      if (locationState.booking.visit_type) {
        setSelectedVisitType(locationState.booking.visit_type);
      }
    }
  }, [location.state]);

  // Formatowanie daty dla podsumowania
  const formatScheduledDate = (dateString?: string) => {
    if (!dateString) return 'Termin wybrany w kalendarzu';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const formatted = new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateString;
    }
  };

  // Refs zapobiegające nieświeżemu domknięciu w Cal.com embed API listenerze
  const profileIdRef = useRef('');
  const selectedVisitTypeRef = useRef<VisitType | null>(null);
  const isSubmittingPaymentRef = useRef(false);

  useEffect(() => {
    profileIdRef.current = profileId;
  }, [profileId]);

  useEffect(() => {
    selectedVisitTypeRef.current = selectedVisitType;
  }, [selectedVisitType]);

  // Funkcja inicjująca płatność w Przelewy24
  const initiatePayment = async (bookingInfo: { id?: string; uid?: string; date?: string }) => {
    if (isSubmittingPaymentRef.current) return;
    isSubmittingPaymentRef.current = true;
    setIsSubmittingPayment(true);

    toast.dismiss();
    const loadingToast = toast.loading("Trwa przygotowywanie płatności Przelewy24...");
    try {
      const response = await fetch(
        "https://znlwhnyxvqxtvixkyrse.supabase.co/functions/v1/p24-create-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(import.meta.env.VITE_SUPABASE_ANON_KEY
              ? {
                  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                }
              : {}),
          },
          body: JSON.stringify({
            bookingId: bookingInfo.id || undefined,
            external_id: bookingInfo.uid || undefined,
            profile_id: profileIdRef.current || undefined,
            visit_type_id: selectedVisitTypeRef.current?.id || undefined,
            scheduled_at: bookingInfo.date || new Date().toISOString(),
            return_url: `${window.location.origin}/panel/pacjent/dashboard`
          }),
        }
      );

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        if (data?.redirectUrl) {
          toast.loading("Przekierowywanie do Przelewy24...");
          window.location.href = data.redirectUrl;
          return;
        }
      } else {
        console.error("Błąd odpowiedzi p24-create-transaction:", response.status, await response.text());
        toast.error("Nie udało się rozpocząć transakcji Przelewy24. Wizytę możesz opłacić w panelu pacjenta.");
        navigate('/panel/pacjent/dashboard');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Błąd podczas wywołania p24-create-transaction:", err);
      toast.error("Wystąpił błąd podczas łączenia z systemem płatności.");
      navigate('/panel/pacjent/dashboard');
    } finally {
      isSubmittingPaymentRef.current = false;
      setIsSubmittingPayment(false);
    }
  };

  const bookingBreadcrumb = useMemo(
    () =>
      getBreadcrumbSchema([
        { name: 'Strona główna', path: '/' },
        { name: 'Rezerwacja wizyty', path: '/rezerwacja' },
      ]),
    []
  );

  const seoElement = (
    <SEO
      title="Rezerwacja wizyty – Konsultacja psychologiczna | mgr Joanna Kubiak"
      description="Zarezerwuj wizytę u psychologa dzieci i młodzieży mgr Joanny Kubiak. Dogodne terminy konsultacji stacjonarnej w Swarzędzu oraz konsultacji online z bezpieczną płatnością."
      keywords="rezerwacja wizyty psycholog, umów wizytę Swarzędz, psycholog dziecięcy wizyta, konsultacje psychologiczne rezerwacja"
      canonical="https://www.joannakubiakpsycholog.pl/rezerwacja"
      jsonLd={bookingBreadcrumb}
    />
  );

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
        
        // Register booking successful listener -> Krok 3 podsumowania
        cal("on", {
          action: "bookingSuccessfulV2",
          callback: async (e: { detail: { data: any } }) => {
            console.log("Cal.com booking success event:", e.detail);
            const bookingUid = e.detail?.data?.uid;
            const bookingDate = e.detail?.data?.date || e.detail?.data?.startTime || new Date().toISOString();

            if (bookingUid) {
              setPendingBooking({ uid: bookingUid, date: bookingDate });
            }
            setStep(3);
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
        {seoElement}
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
        {seoElement}
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
      {seoElement}
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
              3. Podsumowanie i płatność
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
                  {selectedVisitType?.cal_slug ? (
                    <Cal
                      key={selectedVisitType.id}
                      calLink={`joanna-kubiak-0ojprl/${selectedVisitType.cal_slug}?metadata[userId]=${profileId}&metadata[visitTypeId]=${selectedVisitType.id}`}
                      style={{ width: "100%", height: "550px", overflow: "scroll" }}
                      config={{
                        name: fullName,
                        email: email,
                        phone: `${phonePrefix}${phoneNumber}`,
                        theme: "light",
                        "metadata[userId]": profileId,
                        "metadata[visitTypeId]": selectedVisitType.id
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-center px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="font-semibold text-gray-700 mb-1">Brak skonfigurowanego kalendarza dla tej usługi</p>
                      <p className="text-xs text-gray-500 max-w-sm">
                        Usługa nie posiada przypisanego kalendarza Cal.com. Skontaktuj się z gabinetem telefonicznie lub wybierz inną usługę.
                      </p>
                    </div>
                  )}
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
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop";
                      }}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-soft mb-4"
                    />
                    <h3 className="font-serif font-bold text-lg text-dark-green">mgr Joanna Kubiak</h3>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Psycholog dziecięcy i młodzieży</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Konsultacja odbywa się w bezpiecznej, wspierającej atmosferze. Wybierz dogodny termin w kalendarzu obok.
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

                  {/* Informacja o kolejnym kroku i płatnościach online */}
                  <div className="bg-[#F6FAF4] rounded-3xl p-6 border border-[#C4DEBE]/35 text-sm text-gray-600 space-y-2">
                    <div className="flex gap-2 items-start">
                      <span className="p-1 bg-[#C4DEBE]/40 text-[#2F5C3A] rounded-lg mt-0.5">💡</span>
                      <p>Po wybraniu terminu w kalendarzu przejdziesz do podsumowania wizyty i bezpiecznej płatności online przez <strong>Przelewy24</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-xl mx-auto py-2">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F6FAF4] text-dark-green rounded-full mb-3 border border-[#C4DEBE]/40">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-dark-green">Podsumowanie rezerwacji</h2>
                  <p className="text-xs text-gray-500 mt-1">Sprawdź szczegóły swojej wizyty i przejdź do płatności</p>
                </div>

                {/* Karta ze szczegółami rezerwacji */}
                <div className="bg-[#F9FAF8] rounded-2xl border border-gray-200 p-6 mb-6 space-y-4">
                  <div className="flex items-start justify-between pb-4 border-b border-gray-200/80">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Wybrana usługa</span>
                      <h3 className="font-serif font-bold text-lg text-dark-green mt-0.5">{selectedVisitType?.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5 text-dark-green/70" />
                        <span>Czas trwania: {selectedVisitType?.duration} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Do zapłaty</span>
                      <p className="font-serif font-bold text-2xl text-dark-green mt-0.5">{selectedVisitType?.price} zł</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="w-8 h-8 rounded-full bg-light-green-bg flex items-center justify-center text-dark-green shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Termin wizyty</span>
                        <span className="font-semibold text-gray-800">
                          {formatScheduledDate(pendingBooking?.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                      <img 
                        src="/zdjęcia/joanna_kubiak.jpg" 
                        alt="mgr Joanna Kubiak"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop";
                        }}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" 
                      />
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Specjalista</span>
                        <span className="font-semibold text-gray-800">mgr Joanna Kubiak</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Klauzula prawna akceptacji regulaminu i polityki */}
                <div className={`p-4 rounded-2xl border transition-all text-xs text-gray-700 leading-relaxed mb-6 ${
                  termsWarning 
                    ? 'border-red-300 bg-red-50/70 shadow-xs' 
                    : 'border-gray-200 bg-gray-50/70'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (e.target.checked) setTermsWarning(false);
                      }}
                      className="mt-0.5 rounded border-gray-300 text-dark-green focus:ring-dark-green h-4 w-4 shrink-0 cursor-pointer" 
                    />
                    <span>
                      Akceptuję{' '}
                      <Link 
                        to="/regulamin" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-dark-green font-semibold underline underline-offset-2 hover:text-pastel-blue transition-colors"
                      >
                        Regulamin serwisu
                      </Link>{' '}
                      oraz{' '}
                      <Link 
                        to="/polityka-prywatnosci" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-dark-green font-semibold underline underline-offset-2 hover:text-pastel-blue transition-colors"
                      >
                        Politykę Prywatności
                      </Link>
                      . Płatności online obsługuje serwis <strong>Przelewy24</strong> (PayPro S.A.).
                    </span>
                  </label>
                  {termsWarning && (
                    <p className="text-[11px] text-red-600 font-medium mt-2 pl-7 flex items-center gap-1.5 animate-fadeIn">
                      <span>⚠️</span>
                      <span>Zaznacz powyższe pole, aby sfinalizować rezerwację i przejść do płatności.</span>
                    </p>
                  )}
                </div>

                {/* Przycisk płatności i powrotu */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!termsAccepted) {
                        setTermsWarning(true);
                        return;
                      }
                      if (pendingBooking) {
                        initiatePayment(pendingBooking);
                      } else {
                        toast.error("Brak danych rezerwacji. Wybierz termin ponownie.");
                        setStep(2);
                      }
                    }}
                    disabled={isSubmittingPayment}
                    className="w-full bg-[#2F5C3A] hover:bg-[#254A2E] disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-soft hover:-translate-y-0.5 transform flex items-center justify-center gap-2 cursor-pointer text-base"
                  >
                    <span>Opłać wizytę przez Przelewy24 ({selectedVisitType?.price} zł)</span>
                    <span className="text-lg">→</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-gray-500 hover:text-dark-green transition-colors font-medium py-1 inline-flex items-center gap-1"
                    >
                      ← Wróć do kalendarza (zmień termin)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

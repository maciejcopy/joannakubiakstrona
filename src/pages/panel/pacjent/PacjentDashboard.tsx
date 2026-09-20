import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { pacjentSidebarItems } from '../../../config/sidebarConfig';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  X,
  XCircle,
  RotateCcw,
  Phone,
  Info,
  Loader2,
  Plus
} from 'lucide-react';
import Cal, { getCalApi } from '@calcom/embed-react';

interface Booking {
  id: string;
  scheduled_at: string;
  created_at?: string;
  is_first_visit: boolean;
  external_id?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  payment_status_id?: string;
  visit_types: {
    id: string;
    title: string;
    price: number;
    duration: number;
    cal_slug?: string;
  };
  booking_statuses: {
    label: string;
    name: string;
  };
  location_types: {
    label: string;
  };
  payment_statuses?: {
    label: string;
    name: string;
  };
}

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone_prefix?: string;
  phone_number?: string;
}

export const PacjentDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const showRescheduleModalRef = useRef(false);

  useEffect(() => {
    showRescheduleModalRef.current = showRescheduleModal;
  }, [showRescheduleModal]);

  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Przekierowanie do rezerwacji z parametru tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'rezerwacja') {
      navigate('/rezerwacja', { state: { from: '/panel/pacjent/dashboard' } });
    }
  }, [searchParams, navigate]);

  const fetchBookings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Pobierz profil pacjenta
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_prefix, phone_number')
        .eq('auth_id', user.id)
        .single();

      if (!userProfile) return;
      setProfile(userProfile);
      sessionStorage.setItem('panel_profile_id', userProfile.id);

      // Pobierz rezerwacje pacjenta z relacjami
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_at,
          created_at,
          is_first_visit,
          external_id,
          cancellation_reason,
          cancelled_at,
          payment_status_id,
          visit_types(id, title, price, duration, cal_slug),
          booking_statuses(label, name),
          location_types(label),
          payment_statuses(label, name)
        `)
        .eq('client_id', userProfile.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setBookings((data as any) || []);
    } catch (err) {
      console.error('Błąd pobierania wizyt:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    // Wywołanie weryfikacji i zwolnienia wygasłych rezerwacji (>2h) w tle
    supabase.functions.invoke('cancel-expired-unpaid-bookings').catch(() => {});
  }, [fetchBookings]);

  // Inicjalizacja Cal.com Embed API pod kątem przełożenia wizyty
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi();
        cal('ui', {
          theme: 'light',
          styles: { branding: { brandColor: '#2F5C3A' } },
          hideEventTypeDetails: false,
          layout: 'month_view'
        });

        cal('on', {
          action: 'bookingSuccessfulV2',
          callback: (e: any) => {
            // Ignoruj zdarzenie jeśli modal przełożenia nie jest otwarty w panelu pacjenta (np. nowa rezerwacja w BookingWizard)
            if (!showRescheduleModalRef.current) {
              return;
            }
            console.log('Cal.com reschedule success event:', e);
            toast.success('Termin wizyty został pomyślnie zmieniony!');
            setShowRescheduleModal(false);
            setSelectedBooking(null);
            fetchBookings();
          }
        });
      } catch (err) {
        console.error('Błąd inicjalizacji Cal.com Embed API w panelu pacjenta:', err);
      }
    })();
  }, [fetchBookings]);

  // Pomocnicza kalkulacja okna 24h
  const getHoursToVisit = (scheduledAt: string) => {
    return (new Date(scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);
  };

  const isMoreThan24Hours = (scheduledAt: string) => {
    return getHoursToVisit(scheduledAt) >= 24;
  };

  // Pomocnicza kalkulacja okna 2 godzin na opłacenie rezerwacji
  const getPaymentDeadlineInfo = (createdAt?: string) => {
    if (!createdAt) {
      return { isExpired: false, minutesRemaining: 120, text: 'Wymaga opłacenia' };
    }
    const createdTime = new Date(createdAt).getTime();
    const deadlineTime = createdTime + 2 * 60 * 60 * 1000; // 2 godziny w ms
    const diffMs = deadlineTime - Date.now();
    const minutesRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const isExpired = diffMs <= 0;

    let text = '';
    if (isExpired) {
      text = 'Czas na opłacenie (2h) minął';
    } else if (minutesRemaining >= 60) {
      const hours = Math.floor(minutesRemaining / 60);
      const mins = minutesRemaining % 60;
      text = `Pozostało ${hours}h ${mins > 0 ? `${mins}m` : ''} na opłacenie`;
    } else {
      text = `Pozostało ${minutesRemaining} min na opłacenie`;
    }

    return { isExpired, minutesRemaining, text };
  };

  // Obsługa opłacenia rezerwacji przez Przelewy24
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const handlePayBooking = async (booking: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const deadline = getPaymentDeadlineInfo(booking.created_at);
    if (deadline.isExpired) {
      toast.error('Czas na opłacenie tej rezerwacji (2h) minął. Termin został zwolniony.');
      return;
    }

    setPayingBookingId(booking.id);
    const loadingToast = toast.loading('Łączenie z Przelewy24...');

    try {
      const { data, error } = await supabase.functions.invoke('p24-create-transaction', {
        body: {
          bookingId: booking.id,
          external_id: booking.external_id || undefined,
          return_url: `${window.location.origin}/panel/pacjent/dashboard`,
        },
      });

      if (error) {
        let errMsg = 'Nie udało się połączyć z systemem płatności.';
        try {
          const body = await (error as any).context?.json();
          if (body?.error) errMsg = body.error;
        } catch {
          if (error.message) errMsg = error.message;
        }
        toast.dismiss(loadingToast);
        toast.error(errMsg);
        return;
      }

      const targetUrl = data?.redirectUrl || data?.paymentUrl;
      if (targetUrl) {
        toast.dismiss(loadingToast);
        toast.success('Przekierowywanie do Przelewy24...');
        window.location.href = targetUrl;
      } else {
        toast.dismiss(loadingToast);
        toast.error('Błąd: nie otrzymano adresu płatności Przelewy24.');
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error('Błąd inicjalizacji płatności:', err);
      toast.error(err.message || 'Wystąpił błąd podczas połączenia z systemem płatności.');
    } finally {
      setPayingBookingId(null);
    }
  };

  // Obsługa odwołania wizyty przez Edge Function calcom-cancel-booking
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setIsCancelling(true);

    try {
      const { data, error } = await supabase.functions.invoke('calcom-cancel-booking', {
        body: {
          bookingId: selectedBooking.id,
          cancellationReason: cancelReason.trim() || undefined,
        },
      });

      if (error) {
        let errMsg = 'Wystąpił błąd podczas odwoływania wizyty.';
        try {
          const body = await (error as any).context?.json();
          if (body?.error) errMsg = body.error;
        } catch {
          if (error.message) errMsg = error.message;
        }
        toast.error(errMsg);
        return;
      }

      toast.success(data?.message || 'Wizyta została pomyślnie anulowana.');
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      await fetchBookings();
    } catch (err: any) {
      console.error('Błąd podczas wywołania anulowania:', err);
      toast.error(err.message || 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setIsCancelling(false);
    }
  };

  const upcomingBookings = bookings.filter(b => new Date(b.scheduled_at) >= new Date());
  const pastBookings = bookings.filter(b => new Date(b.scheduled_at) < new Date());

  return (
    <PanelLayout title="Moje Wizyty" role="pacjent" sidebarItems={pacjentSidebarItems}>
      <div className="space-y-8">
        {/* Górne CTA */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2F5C3A]">Potrzebujesz nowej sesji?</h3>
            <p className="text-sm text-gray-500">Umów wizytę online lub w gabinecie w kilka chwil.</p>
          </div>
          <Link
            to="/rezerwacja"
            state={{ from: '/panel/pacjent/dashboard' }}
            className="px-6 py-3 bg-[#48A7C9] hover:bg-[#3A8BA8] text-white font-medium rounded-xl transition duration-300 shadow-soft flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Zarezerwuj wizytę
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-[#C4DEBE]/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#2F5C3A] animate-spin"></div>
            </div>
            <p className="text-xs font-semibold text-[#2F5C3A]/70 animate-pulse font-serif">Wczytywanie wizyt...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Nadchodzące wizyty */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-serif font-bold text-[#2F5C3A]">Nadchodzące wizyty</h4>
                <span className="text-xs text-gray-400">Kliknij w wizytę, aby zobaczyć szczegóły lub nią zarządzać</span>
              </div>
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map((booking) => {
                    const isCancelled = booking.booking_statuses.name === 'cancelled';
                    const canModify = !isCancelled && isMoreThan24Hours(booking.scheduled_at);
                    const isUnpaid = booking.payment_statuses?.name === 'unpaid';
                    const deadline = getPaymentDeadlineInfo(booking.created_at);

                    return (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                        }}
                        className={`group border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative ${
                          isCancelled
                            ? 'border-red-100 bg-red-50/20 hover:bg-red-50/40'
                            : 'border-[#C4DEBE]/40 bg-[#F6FAF4]/20 hover:bg-[#F6FAF4]/60 hover:border-[#2F5C3A]/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                isCancelled
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {booking.booking_statuses.label}
                            </span>
                            {booking.payment_statuses && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                  booking.payment_statuses.name === 'paid_online'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : booking.payment_statuses.name === 'refund_pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                                    : booking.payment_statuses.name === 'refunded'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                }`}
                              >
                                {booking.payment_statuses.label}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#2F5C3A]" />
                            {booking.location_types.label}
                          </span>
                        </div>

                        <h5 className="font-serif font-bold text-[#2F5C3A] text-lg mb-1 group-hover:text-[#48A7C9] transition">
                          {booking.visit_types.title}
                        </h5>

                        <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium my-2">
                          <Calendar className="w-4 h-4 text-[#2F5C3A]" />
                          <span>
                            {new Date(booking.scheduled_at).toLocaleString('pl-PL', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {booking.visit_types.duration} min
                          </span>
                          <span className="font-semibold text-gray-800">{booking.visit_types.price} zł</span>
                        </div>

                        {/* Baner / przycisk dla rezerwacji nieopłaconej w oknie 2 godzin */}
                        {isUnpaid && !isCancelled && (
                          <div className="mt-3 pt-3 border-t border-amber-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className={`inline-flex items-center gap-1 font-medium ${
                                deadline.isExpired ? 'text-red-700' : 'text-amber-800'
                              }`}>
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {deadline.text}
                              </span>
                            </div>

                            {!deadline.isExpired && (
                              <button
                                type="button"
                                disabled={payingBookingId === booking.id}
                                onClick={(e) => handlePayBooking(booking, e)}
                                className="w-full py-2 px-3 bg-[#2F5C3A] hover:bg-[#25492e] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition duration-200 shadow-soft"
                              >
                                {payingBookingId === booking.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Łączenie z P24...</span>
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Opłać wizytę ({booking.visit_types.price} zł)</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {!isCancelled && (
                          <div className="mt-3 pt-2 text-[11px] font-semibold flex justify-end">
                            {canModify ? (
                              <span className="text-[#2F5C3A] group-hover:underline">
                                Zarządzaj rezerwacją &rarr;
                              </span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Mniej niż 24h do wizyty
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  Brak zaplanowanych wizyt.
                </p>
              )}
            </div>

            {/* Historia wizyt */}
            <div>
              <h4 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Historia wizyt</h4>
              {pastBookings.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usługa</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Płatność</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cena</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pastBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          onClick={() => {
                            setSelectedBooking(booking);
                          }}
                          className="hover:bg-gray-50/80 cursor-pointer transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2F5C3A]">
                            {booking.visit_types.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                booking.booking_statuses.name === 'completed'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : booking.booking_statuses.name === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}
                            >
                              {booking.booking_statuses.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {booking.payment_statuses ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  booking.payment_statuses.name === 'paid_online'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : booking.payment_statuses.name === 'refunded'
                                    ? 'bg-purple-50 text-purple-700'
                                    : booking.payment_statuses.name === 'refund_pending'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'text-gray-500'
                                }`}
                              >
                                {booking.payment_statuses.label}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                            {booking.visit_types.price} zł
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  Brak wcześniejszych wizyt.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL SZCZEGÓŁÓW WIZYTY (z przyciskami Odwołaj / Przełóż)               */}
      {/* ========================================================================= */}
      {selectedBooking && !showCancelModal && !showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Przycisk zamknięcia */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition p-1.5 rounded-full hover:bg-gray-100"
              aria-label="Zamknij szczegóły"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Nagłówek wizyty */}
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Szczegóły rezerwacji</span>
              <h3 className="text-2xl font-serif font-bold text-[#2F5C3A] mt-1">
                {selectedBooking.visit_types.title}
              </h3>
            </div>

            {/* Dane wizyty w kafelkach */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-[#F6FAF4] rounded-2xl border border-[#C4DEBE]/40 space-y-2">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#2F5C3A]">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(selectedBooking.scheduled_at).toLocaleString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-[#C4DEBE]/30">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Czas trwania: {selectedBooking.visit_types.duration} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {selectedBooking.location_types.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">Status wizyty</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                      selectedBooking.booking_statuses.name === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : selectedBooking.booking_statuses.name === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedBooking.booking_statuses.label}
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">Płatność</span>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    <span
                      className={`text-xs font-semibold ${
                        selectedBooking.payment_statuses?.name === 'paid_online'
                          ? 'text-emerald-700'
                          : selectedBooking.payment_statuses?.name === 'refund_pending'
                          ? 'text-amber-800'
                          : selectedBooking.payment_statuses?.name === 'refunded'
                          ? 'text-purple-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {selectedBooking.payment_statuses?.label || 'Nieokreślona'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Baner informacyjny i przycisk opłacenia wizyty nieopłaconej */}
              {selectedBooking.payment_statuses?.name === 'unpaid' &&
                selectedBooking.booking_statuses.name !== 'cancelled' &&
                new Date(selectedBooking.scheduled_at) >= new Date() && (() => {
                  const deadline = getPaymentDeadlineInfo(selectedBooking.created_at);

                  return (
                    <div className={`p-4 rounded-2xl border ${
                      deadline.isExpired
                        ? 'bg-red-50/80 border-red-200 text-red-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                          deadline.isExpired ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold text-sm">
                            {deadline.isExpired
                              ? 'Czas na opłacenie rezerwacji upłynął'
                              : 'Rezerwacja oczekuje na opłacenie'}
                          </p>
                          <p className="leading-relaxed">
                            {deadline.isExpired
                              ? 'Limit 2 godzin na opłacenie rezerwacji minął. Termin został zwolniony i wizyta wkrótce zostanie usunięta.'
                              : `Aby termin pozostał zarezerwowany, opłać wizytę w ciągu 2 godzin od jej złożenia (${deadline.text.toLowerCase()}).`}
                          </p>
                        </div>
                      </div>

                      {!deadline.isExpired && (
                        <div className="mt-3 pt-3 border-t border-amber-200/60">
                          <button
                            type="button"
                            disabled={payingBookingId === selectedBooking.id}
                            onClick={() => handlePayBooking(selectedBooking)}
                            className="w-full py-3 px-4 bg-[#2F5C3A] hover:bg-[#25492e] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-soft"
                          >
                            {payingBookingId === selectedBooking.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Przekierowywanie do Przelewy24...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                <span>Opłać rezerwację online ({selectedBooking.visit_types.price} zł)</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* Informacja jeśli wizyta jest anulowana */}
              {selectedBooking.booking_statuses.name === 'cancelled' && (
                <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Wizyta została anulowana
                  </p>
                  {selectedBooking.cancelled_at && (
                    <p className="text-red-700">
                      Data anulowania: {new Date(selectedBooking.cancelled_at).toLocaleString('pl-PL')}
                    </p>
                  )}
                  {selectedBooking.cancellation_reason && (
                    <p className="text-red-700">
                      Powód: <em>{selectedBooking.cancellation_reason}</em>
                    </p>
                  )}
                  {selectedBooking.payment_statuses?.name === 'refund_pending' && (
                    <div className="mt-2 pt-2 border-t border-red-200/60 font-medium text-amber-900">
                      Środki oczekują na realizację zwrotu na rachunek, z którego dokonano płatności.
                    </div>
                  )}
                  {selectedBooking.payment_statuses?.name === 'refunded' && (
                    <div className="mt-2 pt-2 border-t border-red-200/60 font-medium text-purple-900">
                      Środki zostały zwrócone na rachunek bankowy.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEKCJA PRZYCISKÓW AKCJI DLA WIZYT W PRZYSZŁOŚCI */}
            {selectedBooking.booking_statuses.name === 'confirmed' &&
              new Date(selectedBooking.scheduled_at) >= new Date() && (() => {
                const canModify = isMoreThan24Hours(selectedBooking.scheduled_at);

                return (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Przycisk Przełóż termin */}
                      <button
                        type="button"
                        disabled={!canModify}
                        onClick={() => {
                          if (!canModify) return;
                          setShowRescheduleModal(true);
                        }}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition duration-300 ${
                          canModify
                            ? 'bg-[#2F5C3A] hover:bg-[#25492e] text-white shadow-soft'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Przełóż termin
                      </button>

                      {/* Przycisk Odwołaj wizytę */}
                      <button
                        type="button"
                        disabled={!canModify}
                        onClick={() => {
                          if (!canModify) return;
                          setShowCancelModal(true);
                        }}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition duration-300 ${
                          canModify
                            ? 'border border-red-300 text-red-700 hover:bg-red-50'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Odwołaj wizytę
                      </button>
                    </div>

                    {/* Komunikat o blokadzie < 24h */}
                    {!canModify && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-amber-950">Mniej niż 24 godziny do wizyty</p>
                          <p className="leading-relaxed">
                            Do wizyty zostało mniej niż 24 godziny. Zmiana terminu lub odwołanie możliwe jest wyłącznie po kontakcie z gabinetem:
                          </p>
                          <a
                            href="tel:+48729933833"
                            className="inline-flex items-center gap-1.5 font-bold text-[#2F5C3A] hover:underline pt-1 text-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> +48 729 933 833
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL POTWIERDZENIA ODWOŁANIA WIZYTY                                    */}
      {/* ========================================================================= */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900">Odwołanie wizyty</h3>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-4">
              {selectedBooking.visit_types.title} &bull;{' '}
              {new Date(selectedBooking.scheduled_at).toLocaleString('pl-PL', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            {/* Komunikat o zwrocie w zależności od formy płatności */}
            {selectedBooking.payment_statuses?.name === 'paid_online' ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed mb-4 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Wizyta zostanie anulowana. Środki zostaną zwrócone na rachunek, z którego dokonano płatności.
                </span>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 leading-relaxed mb-4 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span>Czy na pewno chcesz odwołać tę wizytę?</span>
              </div>
            )}

            {/* Opcjonalny powód odwołania */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Powód odwołania (opcjonalnie):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Np. nagła zmiana planów, choroba..."
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#2F5C3A] focus:ring-1 focus:ring-[#2F5C3A]"
              />
            </div>

            {/* Przyciski w modalu odwołania */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Wróć
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-soft disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {isCancelling ? 'Odwoływanie...' : 'Potwierdź odwołanie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL PRZEŁOŻENIA WIZYTY Z KALENDARZEM CAL.COM                         */}
      {/* ========================================================================= */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#2F5C3A]">Zmiana terminu</span>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Przełóż wizytę: {selectedBooking.visit_types.title}
                </h3>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 text-xs text-gray-500">
              Wybierz nowy dogodny termin w poniższym kalendarzu. Płatność za wizytę pozostaje ważna — nie zostaniesz ponownie obciążony.
            </div>

            {/* Widget Cal.com z rescheduleUid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {selectedBooking.external_id ? (
                <Cal
                  calLink={`joanna-kubiak-0ojprl/${selectedBooking.visit_types.cal_slug || 'konsultacja-indywidualna'}?rescheduleUid=${selectedBooking.external_id}&metadata[userId]=${profile?.id || ''}&metadata[visitTypeId]=${selectedBooking.visit_types.id || ''}`}
                  style={{ width: '100%', height: '480px', overflow: 'scroll' }}
                  config={{
                    name: profile?.full_name || '',
                    email: profile?.email || '',
                    phone: `${profile?.phone_prefix || '+48'}${profile?.phone_number || ''}`,
                    theme: 'light',
                    'metadata[userId]': profile?.id || '',
                    'metadata[visitTypeId]': selectedBooking.visit_types.id || '',
                  }}
                />
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  Brak identyfikatora zewnętrznego wizyty w Cal.com. Skontaktuj się z gabinetem telefonicznie.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

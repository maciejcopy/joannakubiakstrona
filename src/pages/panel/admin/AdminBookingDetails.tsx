import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { adminSidebarItems } from '../../../config/sidebarConfig';
import { AlertCircle, CheckCircle2, CreditCard, MapPin, SlidersHorizontal } from 'lucide-react';
import { CustomSelect, SelectOption } from '../../../components/CustomSelect';

const getBookingStatusBadge = (item: SelectOption) => {
  switch (item.name) {
    case 'confirmed':
      return 'bg-emerald-500';
    case 'completed':
      return 'bg-blue-500';
    case 'cancelled':
      return 'bg-rose-500';
    case 'rescheduled':
      return 'bg-amber-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-400';
  }
};

const getPaymentStatusBadge = (item: SelectOption) => {
  switch (item.name) {
    case 'paid':
      return 'bg-emerald-500';
    case 'unpaid':
      return 'bg-amber-500';
    case 'refund_pending':
      return 'bg-orange-500';
    case 'refunded':
      return 'bg-purple-500';
    default:
      return 'bg-gray-400';
  }
};

const getLocationBadge = (item: SelectOption) => {
  switch (item.name) {
    case 'office':
      return 'bg-[#2F5C3A]';
    case 'online':
      return 'bg-[#3A8BA8]';
    default:
      return 'bg-teal-500';
  }
};

interface BookingDetails {
  id: string;
  scheduled_at: string;
  is_first_visit: boolean;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone_prefix: string;
    phone_number: string;
  };
  visit_types: {
    title: string;
    price: number;
    duration: number;
  };
  booking_statuses: {
    id: string;
    name: string;
    label: string;
  };
  payment_statuses: {
    id: string;
    name: string;
    label: string;
  };
  location_types: {
    id: string;
    name: string;
    label: string;
  };
}

interface DictionaryItem {
  id: string;
  name: string;
  label: string;
}

export const AdminBookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dykcjonarze do edycji
  const [statuses, setStatuses] = useState<DictionaryItem[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<DictionaryItem[]>([]);
  const [locations, setLocations] = useState<DictionaryItem[]>([]);

  // Stany formularza
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [selectedPaymentStatusId, setSelectedPaymentStatusId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [markingRefunded, setMarkingRefunded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Pobierz rezerwację
        const { data: bookingData, error: bookingErr } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_at,
            is_first_visit,
            cancellation_reason,
            cancelled_at,
            profiles(id, full_name, email, phone_prefix, phone_number),
            visit_types(title, price, duration),
            booking_statuses(id, name, label),
            payment_statuses(id, name, label),
            location_types(id, name, label)
          `)
          .eq('id', id)
          .single();

        if (bookingErr) throw bookingErr;

        const data = bookingData as any;
        setBooking(data);

        const statusId = data?.booking_statuses?.id || (Array.isArray(data?.booking_statuses) ? data.booking_statuses[0]?.id : '') || '';
        const paymentId = data?.payment_statuses?.id || (Array.isArray(data?.payment_statuses) ? data.payment_statuses[0]?.id : '') || '';
        const locationId = data?.location_types?.id || (Array.isArray(data?.location_types) ? data.location_types[0]?.id : '') || '';

        setSelectedStatusId(statusId);
        setSelectedPaymentStatusId(paymentId);
        setSelectedLocationId(locationId);
        setCancellationReason(data?.cancellation_reason || '');

        // Pobierz słowniki
        const { data: statusList } = await supabase.from('booking_statuses').select('id, name, label');
        const { data: paymentList } = await supabase.from('payment_statuses').select('id, name, label');
        const { data: locationList } = await supabase.from('location_types').select('id, name, label');

        setStatuses(statusList || []);
        setPaymentStatuses(paymentList || []);
        setLocations(locationList || []);
      } catch (err) {
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!booking) return;

    const isCancelledStatus = statuses.find(s => s.id === selectedStatusId)?.name === 'cancelled';

    if (isCancelledStatus && !isConfirmOpen) {
      setIsConfirmOpen(true);
      return;
    }

    try {
      setSaving(true);
      
      const updates: any = {
        status_id: selectedStatusId,
        payment_status_id: selectedPaymentStatusId,
        location_id: selectedLocationId,
        cancellation_reason: isCancelledStatus ? cancellationReason : null,
        cancelled_at: isCancelledStatus ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id);

      if (error) throw error;
      toast.success('Rezerwacja została pomyślnie zaktualizowana!');
      navigate('/panel/admin/dashboard');
    } catch (err: any) {
      toast.error('Wystąpił błąd: ' + err.message);
    } finally {
      setSaving(false);
      setIsConfirmOpen(false);
    }
  };

  const handleMarkAsRefunded = async () => {
    if (!booking) return;
    const refundedStatus = paymentStatuses.find(p => p.name === 'refunded');
    if (!refundedStatus) {
      toast.error("Nie odnaleziono statusu 'refunded' w słowniku.");
      return;
    }

    try {
      setMarkingRefunded(true);
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status_id: refundedStatus.id })
        .eq('id', booking.id);

      if (error) throw error;

      setSelectedPaymentStatusId(refundedStatus.id);
      setBooking(prev => prev ? {
        ...prev,
        payment_statuses: refundedStatus
      } : null);

      toast.success('Płatność została oznaczona jako zwrócona!');
    } catch (err: any) {
      toast.error('Błąd podczas aktualizacji: ' + err.message);
    } finally {
      setMarkingRefunded(false);
    }
  };

  if (loading) {
    return (
      <PanelLayout title="Szczegóły rezerwacji" role="admin" sidebarItems={adminSidebarItems}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      </PanelLayout>
    );
  }

  if (!booking) {
    return (
      <PanelLayout title="Szczegóły rezerwacji" role="admin" sidebarItems={adminSidebarItems}>
        <div className="text-center py-12 text-gray-500">
          Rezerwacja nie została odnaleziona.
        </div>
      </PanelLayout>
    );
  }

  const isSelectedStatusCancelled = statuses.find(s => s.id === selectedStatusId)?.name === 'cancelled';

  return (
    <PanelLayout title="Szczegóły Wizyty" role="admin" sidebarItems={adminSidebarItems}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lewa kolumna: Informacje o wizycie */}
        <div className="lg:col-span-2 space-y-6">
          {booking.payment_statuses?.name === 'refund_pending' && (
            <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Wizyta anulowana — oczekuje na zwrot środków</h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Wizyta została odwołana przez pacjenta na min. 24h przed terminem. Wykonaj ręczny zwrot w panelu Przelewy24, a następnie kliknij przycisk obok, aby oznaczyć wizytę jako zwróconą.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleMarkAsRefunded}
                disabled={markingRefunded}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap shadow-soft disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {markingRefunded ? 'Zapisywanie...' : 'Oznacz jako zwrócone'}
              </button>
            </div>
          )}

          {booking.payment_statuses?.name === 'refunded' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-xs text-purple-900">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Środki za tę wizytę zostały pomyślnie zwrócone pacjentowi.</span>
            </div>
          )}

          {(booking.cancelled_at || booking.cancellation_reason) && (
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
              <span className="font-bold block uppercase text-[10px] text-red-700">Szczegóły odwołania</span>
              {booking.cancelled_at && (
                <p>Data anulowania: {new Date(booking.cancelled_at).toLocaleString('pl-PL')}</p>
              )}
              {booking.cancellation_reason && (
                <p>Powód: <em>{booking.cancellation_reason}</em></p>
              )}
            </div>
          )}

          <div className="bg-[#F6FAF4]/30 border border-[#C4DEBE]/20 p-6 rounded-2xl">
            <h3 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Informacje o sesji</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="text-xs text-gray-400 block uppercase">Rodzaj usługi</span>
                <span className="font-semibold">{booking.visit_types.title}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase">Planowany termin</span>
                <span className="font-semibold">{new Date(booking.scheduled_at).toLocaleString('pl-PL')}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase">Czas trwania</span>
                <span>{booking.visit_types.duration} minut</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase">Cena</span>
                <span className="font-bold text-[#48A7C9]">{booking.visit_types.price} zł</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAF4]/30 border border-[#C4DEBE]/20 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-serif font-bold text-[#2F5C3A]">Karta pacjenta</h3>
              <Link to={`/panel/admin/clients/${booking.profiles.id}`} className="text-xs font-semibold text-[#48A7C9] hover:underline">
                Zobacz profil →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="text-xs text-gray-400 block uppercase">Nazwisko i Imię</span>
                <span className="font-semibold">{booking.profiles.full_name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase">Telefon</span>
                <span>{booking.profiles.phone_prefix} {booking.profiles.phone_number}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block uppercase">Email</span>
                <span>{booking.profiles.email || 'Brak (pacjent offline)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prawa kolumna: Aktualizacja statusów */}
        <div className="bg-white border border-[#C4DEBE]/40 p-6 rounded-2xl h-fit shadow-soft">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <SlidersHorizontal className="w-4 h-4 text-[#2F5C3A]" />
            <h3 className="text-md font-serif font-bold text-[#2F5C3A]">Zarządzanie wizytą</h3>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Status rezerwacji
              </label>
              <CustomSelect
                value={selectedStatusId}
                onChange={setSelectedStatusId}
                options={statuses}
                placeholder="Wybierz status..."
                getBadgeColor={getBookingStatusBadge}
              />
            </div>

            {isSelectedStatusCancelled && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Powód odwołania
                </label>
                <textarea
                  required
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#2F5C3A] focus:ring-2 focus:ring-[#2F5C3A]/20 focus:outline-none transition-all duration-200 h-20 resize-none shadow-2xs"
                  placeholder="Podaj powód anulowania wizyty..."
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                Status płatności
              </label>
              <CustomSelect
                value={selectedPaymentStatusId}
                onChange={setSelectedPaymentStatusId}
                options={paymentStatuses}
                placeholder="Wybierz status płatności..."
                getBadgeColor={getPaymentStatusBadge}
              />
              {paymentStatuses.find(p => p.id === selectedPaymentStatusId)?.name === 'refund_pending' && (
                <button
                  type="button"
                  onClick={handleMarkAsRefunded}
                  disabled={markingRefunded}
                  className="mt-2.5 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  Szybka akcja: Oznacz jako zwrócone
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Lokalizacja
              </label>
              <CustomSelect
                value={selectedLocationId}
                onChange={setSelectedLocationId}
                options={locations}
                placeholder="Wybierz lokalizację..."
                getBadgeColor={getLocationBadge}
              />
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 active:scale-[0.99] text-white rounded-xl text-xs font-semibold transition duration-200 shadow-soft disabled:opacity-50"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
              <Link
                to="/panel/admin/dashboard"
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center transition duration-200"
              >
                Powrót
              </Link>
            </div>
          </form>
        </div>

      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Odwołanie wizyty"
        message={`Czy na pewno chcesz anulować tę wizytę? Powód: "${cancellationReason || 'Nie podano'}"`}
        confirmLabel="Tak, anuluj wizytę"
        cancelLabel="Wróć"
        type="danger"
        onConfirm={() => handleUpdate()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </PanelLayout>
  );
};

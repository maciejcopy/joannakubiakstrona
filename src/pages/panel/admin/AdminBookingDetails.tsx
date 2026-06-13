import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

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

  const sidebarItems = [
    {
      label: 'Dashboard',
      path: '/panel/admin/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      label: 'Kalendarz',
      path: '/panel/admin/kalendarz',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Klienci',
      path: '/panel/admin/klienci',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      label: 'Typy Sesji',
      path: '/panel/admin/sesje',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: 'Ustawienia',
      path: '/panel/admin/ustawienia',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      label: 'Mój Profil',
      path: '/profil',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

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
        setBooking(bookingData as any);
        setSelectedStatusId(bookingData.booking_statuses.id);
        setSelectedPaymentStatusId(bookingData.payment_statuses.id);
        setSelectedLocationId(bookingData.location_types.id);
        setCancellationReason(bookingData.cancellation_reason || '');

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

  if (loading) {
    return (
      <PanelLayout title="Szczegóły rezerwacji" role="admin" sidebarItems={sidebarItems}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      </PanelLayout>
    );
  }

  if (!booking) {
    return (
      <PanelLayout title="Szczegóły rezerwacji" role="admin" sidebarItems={sidebarItems}>
        <div className="text-center py-12 text-gray-500">
          Rezerwacja nie została odnaleziona.
        </div>
      </PanelLayout>
    );
  }

  const isSelectedStatusCancelled = statuses.find(s => s.id === selectedStatusId)?.name === 'cancelled';

  return (
    <PanelLayout title="Szczegóły Wizyty" role="admin" sidebarItems={sidebarItems}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lewa kolumna: Informacje o wizycie */}
        <div className="lg:col-span-2 space-y-6">
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
        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl h-fit">
          <h3 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Zarządzanie wizytą</h3>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Status rezerwacji</label>
              <select
                value={selectedStatusId}
                onChange={(e) => setSelectedStatusId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {isSelectedStatusCancelled && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Powód odwołania</label>
                <textarea
                  required
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl text-sm h-20"
                  placeholder="Podaj powód anulowania wizyty..."
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Status płatności</label>
              <select
                value={selectedPaymentStatusId}
                onChange={(e) => setSelectedPaymentStatusId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              >
                {paymentStatuses.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Lokalizacja</label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white rounded-xl text-xs font-semibold transition"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
              <Link
                to="/panel/admin/dashboard"
                className="w-full py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center transition"
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

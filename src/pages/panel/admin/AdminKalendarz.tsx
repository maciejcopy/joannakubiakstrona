import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { toast } from 'react-hot-toast';

interface ClientProfile {
  id: string;
  full_name: string;
}

interface VisitType {
  id: string;
  title: string;
  price: number;
}

interface Booking {
  id: string;
  scheduled_at: string;
  profiles: {
    full_name: string;
  };
  visit_types: {
    title: string;
  };
}

export const AdminKalendarz: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stan formularza nowej rezerwacji offline
  const [showModal, setShowModal] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Dane nowego klienta offline
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+48');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [add1, setAdd1] = useState('');
  const [city, setCity] = useState('');
  const [postCode, setPostCode] = useState('');
  
  // Szczegóły rezerwacji
  const [selectedVisitTypeId, setSelectedVisitTypeId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, scheduled_at, profiles(full_name), visit_types(title)')
        .order('scheduled_at', { ascending: true });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'client')
        .order('full_name');

      const { data: visitTypesData } = await supabase
        .from('visit_types')
        .select('id, title, price')
        .eq('is_active', true);

      setBookings((bookingsData as any) || []);
      setClients(profilesData || []);
      setVisitTypes(visitTypesData || []);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOfflineBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalClientId = selectedClientId;

      // Jeśli dodajemy nowego klienta offline
      if (isNewClient) {
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert({
            full_name: fullName,
            phone_prefix: phonePrefix,
            phone_number: phoneNumber,
            add1,
            city,
            post_code: postCode,
            role: 'client'
          })
          .select()
          .single();

        if (profileErr) throw profileErr;
        finalClientId = newProfile.id;
      }

      // Pobranie domyślnego statusu rezerwacji ('confirmed')
      const { data: confirmedStatus } = await supabase
        .from('booking_statuses')
        .select('id')
        .eq('name', 'confirmed')
        .single();

      // Pobranie domyślnego statusu płatności ('unpaid')
      const { data: unpaidStatus } = await supabase
        .from('payment_statuses')
        .select('id')
        .eq('name', 'unpaid')
        .single();

      // Pobranie domyślnego typu lokalizacji ('office')
      const { data: officeLocation } = await supabase
        .from('location_types')
        .select('id')
        .eq('name', 'office')
        .single();

      const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();

      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          client_id: finalClientId,
          visit_type_id: selectedVisitTypeId,
          scheduled_at: scheduledAt,
          status_id: confirmedStatus?.id,
          payment_status_id: unpaidStatus?.id,
          location_id: officeLocation?.id
        });

      if (bookingErr) throw bookingErr;

      toast.success('Rezerwacja offline dodana pomyślnie!');
      setShowModal(false);
      
      // Reset formularza
      setFullName('');
      setPhoneNumber('');
      setAdd1('');
      setCity('');
      setPostCode('');
      setBookingDate('');
      setBookingTime('');
      
      fetchData();
    } catch (err: any) {
      toast.error('Błąd podczas dodawania rezerwacji: ' + err.message);
    }
  };

  return (
    <PanelLayout title="Kalendarz Wizyt" role="admin" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-4">
          <p className="text-sm text-gray-500">Zarządzaj terminami i dodawaj rezerwacje offline.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-medium rounded-xl transition duration-300 flex items-center gap-2 text-sm shadow-soft"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Dodaj rezerwację offline
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-md font-serif font-bold text-[#2F5C3A]">Zaplanowane wizyty w systemie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-100 p-5 rounded-2xl bg-gray-50/50">
                  <span className="text-xs font-semibold text-[#48A7C9]">
                    {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')} o {new Date(booking.scheduled_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <h5 className="font-serif font-bold text-gray-800 text-lg mt-1">{booking.profiles?.full_name || 'Pacjent offline'}</h5>
                  <p className="text-sm text-gray-600 mt-1">{booking.visit_types?.title}</p>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-gray-500 col-span-3 text-center py-12">Brak rezerwacji w kalendarzu.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Rezerwacji Offline */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-[#2F5C3A]">Rezerwacja Offline</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddOfflineBooking} className="space-y-4">
              {/* Wybór rodzaju pacjenta */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Typ pacjenta:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isNewClient}
                      onChange={() => setIsNewClient(false)}
                      className="text-[#2F5C3A] focus:ring-[#2F5C3A]"
                    />
                    Istniejący pacjent
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={isNewClient}
                      onChange={() => setIsNewClient(true)}
                      className="text-[#2F5C3A] focus:ring-[#2F5C3A]"
                    />
                    Nowy pacjent offline
                  </label>
                </div>
              </div>

              {/* Formularz klienta */}
              {!isNewClient ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Wybierz pacjenta</label>
                  <select
                    required={!isNewClient}
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="">-- Wybierz z listy --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Imię i Nazwisko</label>
                    <input
                      type="text"
                      required={isNewClient}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Numer telefonu</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm"
                      />
                      <input
                        type="tel"
                        required={isNewClient}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Adres (Ulica, nr)</label>
                    <input
                      type="text"
                      required={isNewClient}
                      value={add1}
                      onChange={(e) => setAdd1(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600">Kod pocztowy</label>
                      <input
                        type="text"
                        required={isNewClient}
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-semibold text-gray-600">Miasto</label>
                      <input
                        type="text"
                        required={isNewClient}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Szczegóły wizyty */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Wybierz usługę</label>
                <select
                  required
                  value={selectedVisitTypeId}
                  onChange={(e) => setSelectedVisitTypeId(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">-- Wybierz usługę --</option>
                  {visitTypes.map(v => (
                    <option key={v.id} value={v.id}>{v.title} ({v.price} zł)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data wizyty</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Godzina wizyty</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white rounded-xl text-sm font-semibold transition shadow-soft"
                >
                  Zapisz wizytę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

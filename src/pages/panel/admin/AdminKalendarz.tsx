import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  is_first_visit: boolean;
  source?: string;
  profiles: {
    full_name: string;
  };
  visit_types: {
    id: string;
    title: string;
  };
  booking_statuses: {
    id: string;
    label: string;
    name: string;
  };
}

export const AdminKalendarz: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [statuses, setStatuses] = useState<{ id: string; name: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Stany filtrów
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVisitType, setFilterVisitType] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [filterCustomDate, setFilterCustomDate] = useState('');

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
        .select('id, scheduled_at, is_first_visit, source, profiles(full_name), visit_types(id, title), booking_statuses(id, label, name)')
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

      const { data: statusesData } = await supabase
        .from('booking_statuses')
        .select('id, name, label')
        .order('label');

      setBookings((bookingsData as any) || []);
      setClients(profilesData || []);
      setVisitTypes(visitTypesData || []);
      setStatuses(statusesData || []);
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

  // Logika filtrowania rezerwacji
  const filteredBookings = bookings.filter((booking) => {
    // 1. Filtrowanie po statusie
    if (filterStatus && booking.booking_statuses?.id !== filterStatus) {
      return false;
    }

    // 2. Filtrowanie po typie usługi
    if (filterVisitType && booking.visit_types?.id !== filterVisitType) {
      return false;
    }

    // 3. Filtrowanie po dacie
    if (filterDateRange) {
      const bookingDate = new Date(booking.scheduled_at);
      const now = new Date();
      
      if (filterDateRange === 'today') {
        if (bookingDate.toDateString() !== now.toDateString()) {
          return false;
        }
      } else if (filterDateRange === 'last-3-days') {
        const limit = new Date();
        limit.setDate(now.getDate() - 3);
        if (bookingDate < limit || bookingDate > now) {
          return false;
        }
      } else if (filterDateRange === 'last-week') {
        const limit = new Date();
        limit.setDate(now.getDate() - 7);
        if (bookingDate < limit || bookingDate > now) {
          return false;
        }
      } else if (filterDateRange === 'next-3-days') {
        const limit = new Date();
        limit.setDate(now.getDate() + 3);
        if (bookingDate > limit || bookingDate < now) {
          return false;
        }
      } else if (filterDateRange === 'next-week') {
        const limit = new Date();
        limit.setDate(now.getDate() + 7);
        if (bookingDate > limit || bookingDate < now) {
          return false;
        }
      } else if (filterDateRange === 'custom') {
        if (filterCustomDate) {
          const customStr = new Date(filterCustomDate).toDateString();
          if (bookingDate.toDateString() !== customStr) {
            return false;
          }
        }
      }
    }

    return true;
  });

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

        {/* Filtry nad tabelą */}
        <div className="bg-[#F6FAF4]/50 border border-[#C4DEBE]/35 p-5 rounded-2xl">
          <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filtruj rezerwacje</h5>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Status */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A]"
              >
                <option value="">Wszystkie statusy</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Typ usługi */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Typ usługi</label>
              <select
                value={filterVisitType}
                onChange={(e) => setFilterVisitType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A]"
              >
                <option value="">Wszystkie usługi</option>
                {visitTypes.map(vt => (
                  <option key={vt.id} value={vt.id}>{vt.title}</option>
                ))}
              </select>
            </div>

            {/* Zakres dat */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Termin wizyty</label>
              <select
                value={filterDateRange}
                onChange={(e) => {
                  setFilterDateRange(e.target.value);
                  if (e.target.value !== 'custom') {
                    setFilterCustomDate('');
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A]"
              >
                <option value="">Wszystkie terminy</option>
                <option value="today">Dzisiaj</option>
                <option value="last-3-days">Ostatnie 3 dni</option>
                <option value="last-week">Ostatni tydzień</option>
                <option value="next-3-days">Nadchodzące 3 dni</option>
                <option value="next-week">Nadchodzący tydzień</option>
                <option value="custom">Wybrana data...</option>
              </select>
            </div>

            {/* Wybrana data (pokazuje się tylko przy 'custom') */}
            {filterDateRange === 'custom' && (
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Wybierz datę</label>
                <input
                  type="date"
                  value={filterCustomDate}
                  onChange={(e) => setFilterCustomDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A]"
                />
              </div>
            )}

            {/* Reset filtrów */}
            {(filterStatus || filterVisitType || filterDateRange || filterCustomDate) && (
              <div>
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setFilterVisitType('');
                    setFilterDateRange('');
                    setFilterCustomDate('');
                  }}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition duration-200"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-serif font-bold text-[#2F5C3A]">Zaplanowane wizyty w systemie</h4>
              <span className="text-xs text-gray-500">Znaleziono: {filteredBookings.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Klient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usługa</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Źródło</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => navigate(`/panel/admin/bookings/${booking.id}`)}
                      className="cursor-pointer hover:bg-[#F6FAF4]/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {booking.profiles?.full_name || 'Klient offline'}
                        {booking.is_first_visit && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            1sza wizyta
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.visit_types?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(booking.scheduled_at).toLocaleString('pl-PL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.source === 'website' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            Strona WWW
                          </span>
                        ) : booking.source === 'znany_lekarz' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            ZnanyLekarz
                          </span>
                        ) : booking.source === 'wspieramy_mentalnie' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            WspieramyM.
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                            Ręczna (Offline)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition duration-300 ${
                          booking.booking_statuses?.name === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                            : booking.booking_statuses?.name === 'completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                            : booking.booking_statuses?.name === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200/50'
                            : 'bg-amber-50 text-amber-700 border-amber-200/50'
                        }`}>
                          {booking.booking_statuses?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Brak pasujących rezerwacji w kalendarzu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

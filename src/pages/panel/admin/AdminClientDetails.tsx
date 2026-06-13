import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';

interface ProfileDetails {
  id: string;
  full_name: string;
  email: string | null;
  phone_prefix: string;
  phone_number: string;
  add1: string | null;
  add2: string | null;
  post_code: string | null;
  city: string | null;
  county: string | null;
  country: string;
  created_at: string;
}

interface ClientBooking {
  id: string;
  scheduled_at: string;
  visit_types: {
    title: string;
    price: number;
  };
  booking_statuses: {
    label: string;
    name: string;
  };
}

export const AdminClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  ];

  useEffect(() => {
    async function fetchClientDetails() {
      try {
        setLoading(true);
        // Pobierz profil klienta
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileErr) throw profileErr;
        setProfile(profileData);

        // Pobierz jego listę wizyt
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, scheduled_at, visit_types(title, price), booking_statuses(label, name)')
          .eq('client_id', id)
          .order('scheduled_at', { ascending: false });

        setBookings((bookingsData as any) || []);
      } catch (err) {
        console.error('Error fetching client details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClientDetails();
  }, [id]);

  if (loading) {
    return (
      <PanelLayout title="Profil Klienta" role="admin" sidebarItems={sidebarItems}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      </PanelLayout>
    );
  }

  if (!profile) {
    return (
      <PanelLayout title="Profil Klienta" role="admin" sidebarItems={sidebarItems}>
        <div className="text-center py-12 text-gray-500">
          Profil nie został odnaleziony.
        </div>
      </PanelLayout>
    );
  }

  const completedVisits = bookings.filter(b => b.booking_statuses?.name === 'completed');
  const totalSpent = completedVisits.reduce((sum, b) => sum + (b.visit_types?.price || 0), 0);

  return (
    <PanelLayout title={`Karta Klienta: ${profile.full_name}`} role="admin" sidebarItems={sidebarItems}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lewa kolumna: Szczegółowe dane teleadresowe */}
        <div className="space-y-6">
          <div className="bg-[#F6FAF4]/30 border border-[#C4DEBE]/20 p-6 rounded-2xl">
            <h3 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Dane Kontaktowe</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="text-xs text-gray-400 block uppercase">Telefon</span>
                <span className="font-semibold">{profile.phone_prefix} {profile.phone_number}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase">E-mail</span>
                <span>{profile.email || 'Brak (konto offline)'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase">Adres zamieszkania</span>
                <p className="font-medium">{profile.add1}</p>
                {profile.add2 && <p className="text-gray-500">{profile.add2}</p>}
                <p className="font-medium">{profile.post_code} {profile.city}</p>
                {profile.county && <p className="text-xs text-gray-500">Powiat/Województwo: {profile.county}</p>}
                <p className="text-xs text-gray-500">Kraj: {profile.country}</p>
              </div>
              <div className="pt-2">
                <span className="text-xs text-gray-400 block uppercase">Pacjent od</span>
                <span>{new Date(profile.created_at).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAF4]/30 border border-[#C4DEBE]/20 p-6 rounded-2xl">
            <h3 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Statystyki Pacjenta</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Wszystkie wizyty:</span>
                <span className="font-semibold">{bookings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Zrealizowane wizyty:</span>
                <span className="font-semibold">{completedVisits.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-[#2F5C3A]">
                <span>Suma płatności:</span>
                <span>{totalSpent} zł</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prawa kolumna: Historia rezerwacji klienta */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#2F5C3A]">Historia wizyt pacjenta</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usługa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data sesji</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kwota</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Akcja</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {booking.visit_types?.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(booking.scheduled_at).toLocaleString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.booking_statuses?.name === 'completed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : booking.booking_statuses?.name === 'confirmed'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {booking.booking_statuses?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {booking.visit_types?.price} zł
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/panel/admin/bookings/${booking.id}`} className="text-[#48A7C9] hover:underline">
                        Szczegóły
                      </Link>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Brak historii rezerwacji dla tego pacjenta.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PanelLayout>
  );
};

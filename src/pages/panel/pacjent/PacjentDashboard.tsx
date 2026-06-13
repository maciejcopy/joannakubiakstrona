import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';

interface Booking {
  id: string;
  scheduled_at: string;
  is_first_visit: boolean;
  visit_types: {
    title: string;
    price: number;
    duration: number;
  };
  booking_statuses: {
    label: string;
    name: string;
  };
  location_types: {
    label: string;
  };
}

export const PacjentDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Pobierz profil pacjenta
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (!profile) return;

        // Pobierz jego rezerwacje wraz z relacjami
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_at,
            is_first_visit,
            visit_types(title, price, duration),
            booking_statuses(label, name),
            location_types(label)
          `)
          .eq('client_id', profile.id)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        setBookings((data as any) || []);
      } catch (err) {
        console.error('Błąd pobierania wizyt:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const sidebarItems = [
    {
      label: 'Moje Wizyty',
      path: '/panel/pacjent/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Mój Profil',
      path: '/panel/pacjent/profil',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const upcomingBookings = bookings.filter(b => new Date(b.scheduled_at) >= new Date());
  const pastBookings = bookings.filter(b => new Date(b.scheduled_at) < new Date());

  return (
    <PanelLayout title="Moje Wizyty" role="pacjent" sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Górne CTA */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2F5C3A]">Potrzebujesz nowej sesji?</h3>
            <p className="text-sm text-gray-500">Umów wizytę online lub w gabinecie w kilka chwil.</p>
          </div>
          <Link
            to="/rezerwacja"
            className="px-6 py-3 bg-[#48A7C9] hover:bg-[#3A8BA8] text-white font-medium rounded-xl transition duration-300 shadow-soft flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Zarezerwuj wizytę
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Nadchodzące wizyty */}
            <div>
              <h4 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Nadchodzące wizyty</h4>
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border border-[#C4DEBE]/40 rounded-2xl p-5 bg-[#F6FAF4]/20 hover:bg-[#F6FAF4]/50 transition duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-[#2F5C3A] border border-green-200">
                          {booking.booking_statuses.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {booking.location_types.label}
                        </span>
                      </div>
                      <h5 className="font-serif font-bold text-[#2F5C3A] text-lg mb-1">{booking.visit_types.title}</h5>
                      <p className="text-sm text-gray-700 font-medium">
                        {new Date(booking.scheduled_at).toLocaleString('pl-PL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                        <span>Czas: {booking.visit_types.duration} min</span>
                        <span className="font-semibold text-gray-800">{booking.visit_types.price} zł</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  Brak zaplanowanych wizyt.
                </p>
              )}
            </div>

            {/* Historia wizyt */}
            <div>
              <h4 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Historia wizyt</h4>
              {pastBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usługa</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cena</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pastBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2F5C3A]">
                            {booking.visit_types.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.booking_statuses.name === 'completed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                            }`}>
                              {booking.booking_statuses.label}
                            </span>
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
                <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  Brak wcześniejszych wizyt.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

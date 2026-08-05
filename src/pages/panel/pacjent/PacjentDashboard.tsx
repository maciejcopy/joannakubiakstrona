import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { pacjentSidebarItems } from '../../../config/sidebarConfig';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Przekierowanie do rezerwacji z tabem
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'rezerwacja') {
      navigate('/rezerwacja', { state: { from: '/panel/pacjent/dashboard' } });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        // Pobierz profil pacjenta
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (!profile) return;
        const profileId = profile.id;
        sessionStorage.setItem('panel_profile_id', profile.id);

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
          .eq('client_id', profileId)
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
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
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
          <div className="space-y-6">
            {/* Nadchodzące wizyty */}
            <div>
              <h4 className="text-md font-serif font-bold text-[#2F5C3A] mb-4">Nadchodzące wizyty</h4>
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border border-[#C4DEBE]/40 rounded-2xl p-5 bg-[#F6FAF4]/20 hover:bg-[#F6FAF4]/50 transition duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          booking.booking_statuses.name === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-green-50 text-[#2F5C3A] border-green-200'
                        }`}>
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

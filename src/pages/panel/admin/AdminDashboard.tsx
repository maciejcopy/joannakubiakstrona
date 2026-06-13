import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';

interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  totalClients: number;
}

interface RecentBooking {
  id: string;
  scheduled_at: string;
  is_first_visit: boolean;
  profiles: {
    full_name: string;
  };
  visit_types: {
    title: string;
    price: number;
  };
  booking_statuses: {
    label: string;
    name: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<BookingStats>({ totalBookings: 0, confirmedBookings: 0, totalClients: 0 });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        // Fetch total bookings count
        const { count: totalCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });

        // Fetch total clients count
        const { count: clientsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client');

        // Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_at,
            is_first_visit,
            profiles(full_name),
            visit_types(title, price),
            booking_statuses(label, name)
          `)
          .order('scheduled_at', { ascending: false })
          .limit(5);

        setStats({
          totalBookings: totalCount || 0,
          confirmedBookings: bookingsData?.filter((b: any) => b.booking_statuses?.name === 'confirmed').length || 0,
          totalClients: clientsCount || 0
        });

        setRecentBookings((bookingsData as any) || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

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

  return (
    <PanelLayout title="Dashboard" role="admin" sidebarItems={sidebarItems}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statystyki w kartach */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F6FAF4]/50 border border-[#C4DEBE]/30 p-6 rounded-2xl">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Liczba rezerwacji</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalBookings}</p>
            </div>
            <div className="bg-[#F6FAF4]/50 border border-[#C4DEBE]/30 p-6 rounded-2xl">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Potwierdzone wizyty</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.confirmedBookings}</p>
            </div>
            <div className="bg-[#F6FAF4]/50 border border-[#C4DEBE]/30 p-6 rounded-2xl">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Aktywni Klienci</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalClients}</p>
            </div>
          </div>

          {/* Ostatnie rezerwacje */}
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2F5C3A] mb-4">Ostatnie rezerwacje</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Klient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usługa</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {booking.profiles?.full_name || 'Klient offline'}
                        {booking.is_first_visit && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.booking_statuses?.name === 'confirmed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {booking.booking_statuses?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/panel/admin/bookings/${booking.id}`} className="text-[#48A7C9] hover:text-[#3A8BA8]">
                          Szczegóły
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Brak rezerwacji w systemie.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

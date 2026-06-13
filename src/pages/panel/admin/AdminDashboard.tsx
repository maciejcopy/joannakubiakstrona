import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface AuditLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  profiles: {
    full_name: string;
    role: string;
  } | null;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<BookingStats>({ totalBookings: 0, confirmedBookings: 0, totalClients: 0 });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activityFilter, setActivityFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        // Fetch recent audit logs
        const { data: logsData } = await supabase
          .from('audit_logs')
          .select(`
            id,
            action,
            details,
            created_at,
            profiles(full_name, role)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        setStats({
          totalBookings: totalCount || 0,
          confirmedBookings: bookingsData?.filter((b: any) => b.booking_statuses?.name === 'confirmed').length || 0,
          totalClients: clientsCount || 0
        });

        setRecentBookings((bookingsData as any) || []);
        setLogs((logsData as any) || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (activityFilter === 'all') return true;
    const isLogAdmin = log.profiles?.role === 'admin';
    if (activityFilter === 'admin') return isLogAdmin;
    if (activityFilter === 'user') return !isLogAdmin;
    return true;
  });

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
          {/* Statystyki w kartach z podpowiedziami hover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Karta 1 */}
            <div className="group relative bg-[#F6FAF4]/50 border border-[#C4DEBE]/30 p-6 rounded-2xl cursor-help transition-all duration-300 hover:shadow-soft">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Liczba rezerwacji</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalBookings}</p>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Całkowita liczba rezerwacji (oczekujących, potwierdzonych, zrealizowanych i anulowanych) zarejestrowanych w systemie.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Karta 2 */}
            <div className="group relative bg-[#F6FAF4]/50 border border-[#C4DEBE]/30 p-6 rounded-2xl cursor-help transition-all duration-300 hover:shadow-soft">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Potwierdzone wizyty</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.confirmedBookings}</p>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Liczba wizyt o statusie "Potwierdzona", które zostały zatwierdzone przez gabinet.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Karta 3 */}
            <div className="group relative bg-[#F6FAF4]/50 border border-[#C4DEBE]/30 p-6 rounded-2xl cursor-help transition-all duration-300 hover:shadow-soft">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Aktywni Klienci</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalClients}</p>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Liczba zarejestrowanych pacjentów posiadających przypisaną rolę klienta (client) w bazie.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lewa kolumna: Ostatnie rezerwacje */}
            <div className="bg-white border border-[#C4DEBE]/20 rounded-3xl p-6 shadow-soft space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#2F5C3A]">Ostatnie rezerwacje</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Klient</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usługa</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentBookings.map((booking) => (
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
                    {recentBookings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          Brak rezerwacji w systemie.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prawa kolumna: Ostatnia aktywność (Recent Activity) z filtrami */}
            <div className="bg-white border border-[#C4DEBE]/20 rounded-3xl p-6 shadow-soft space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2F5C3A]">Ostatnia aktywność</h3>
                  <p className="text-xs text-gray-400">Rejestr zdarzeń w gabinecie</p>
                </div>
                {/* Filtry działań */}
                <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {(['all', 'user', 'admin'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActivityFilter(type)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                        activityFilter === type
                          ? 'bg-[#2F5C3A] text-white shadow-sm'
                          : 'text-gray-500 hover:text-[#2F5C3A]'
                      }`}
                    >
                      {type === 'all' ? 'Wszystkie' : type === 'user' ? 'Pacjenci' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista aktywności (Timeline) */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => {
                  const isUserAdmin = log.profiles?.role === 'admin';
                  return (
                    <div key={log.id} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0">
                      {/* Ikona zależna od roli */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                        isUserAdmin
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        {isUserAdmin ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>

                      {/* Treść zdarzenia */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {log.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          Kto: <span className="font-medium text-gray-700">{log.profiles?.full_name || 'System / Klient'}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                            isUserAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isUserAdmin ? 'Admin' : 'Pacjent'}
                          </span>
                        </p>
                        {log.details && (
                          <p className="text-xs text-gray-400 mt-1 italic truncate">
                            {log.details.details || log.details.visit_type || log.details.client_name || log.details.email ? (
                              <>
                                {log.details.details && <span>{log.details.details}</span>}
                                {log.details.visit_type && <span>Usługa: {log.details.visit_type}</span>}
                                {log.details.client_name && <span>Pacjent: {log.details.client_name}</span>}
                                {log.details.email && <span>E-mail: {log.details.email}</span>}
                              </>
                            ) : (
                              JSON.stringify(log.details)
                            )}
                          </p>
                        )}
                      </div>

                      {/* Czas zdarzenia */}
                      <div className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-12">Brak pasujących działań w rejestrze.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

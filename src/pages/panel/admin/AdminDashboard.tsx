import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { adminSidebarItems } from '../../../config/sidebarConfig';
import { CalendarDays, CheckCircle, Users, ShieldCheck, User } from 'lucide-react';

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

  return (
    <PanelLayout title="Dashboard" role="admin" sidebarItems={adminSidebarItems}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statystyki w kartach z podpowiedziami hover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Karta 1 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-white border border-[#C4DEBE]/35 border-l-4 border-l-blue-300 p-6 rounded-2xl cursor-help transition-all duration-300 hover:shadow-soft">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Liczba rezerwacji</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalBookings}</p>
              <CalendarDays className="absolute top-6 right-6 h-10 w-10 text-blue-500 opacity-20" />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Całkowita liczba rezerwacji (oczekujących, potwierdzonych, zrealizowanych i anulowanych) zarejestrowanych w systemie.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Karta 2 */}
            <div className="group relative bg-gradient-to-br from-emerald-50 to-white border border-[#C4DEBE]/35 border-l-4 border-l-emerald-300 p-6 rounded-2xl cursor-help transition-all duration-300 hover:shadow-soft">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Potwierdzone wizyty</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.confirmedBookings}</p>
              <CheckCircle className="absolute top-6 right-6 h-10 w-10 text-emerald-500 opacity-20" />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Liczba wizyt o statusie "Potwierdzona", które zostały zatwierdzone przez gabinet.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Karta 3 */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-white border border-[#C4DEBE]/35 border-l-4 border-l-purple-300 p-6 rounded-2xl cursor-help transition-all duration-300 hover:shadow-soft">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Aktywni Klienci</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalClients}</p>
              <Users className="absolute top-6 right-6 h-10 w-10 text-purple-500 opacity-20" />
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
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#2F5C3A]/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#2F5C3A] uppercase">Klient</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#2F5C3A] uppercase">Usługa</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#2F5C3A] uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#2F5C3A] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => navigate(`/panel/admin/bookings/${booking.id}`)}
                        className="cursor-pointer hover:bg-[#F0F7EE] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-[#C4DEBE]/40 text-xs font-bold text-[#2F5C3A] flex items-center justify-center flex-shrink-0">
                              {(booking.profiles?.full_name || 'Klient offline').charAt(0).toUpperCase()}
                            </div>
                            <span>
                              {booking.profiles?.full_name || 'Klient offline'}
                              {booking.is_first_visit && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  1sza wizyta
                                </span>
                              )}
                            </span>
                          </div>
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
              <div className="relative space-y-6 max-h-[400px] overflow-y-auto pr-1">
                {/* Pionowa linia czasu łącząca ikony */}
                {filteredLogs.length > 1 && (
                  <div className="absolute left-4 top-2 bottom-8 w-0.5 bg-gray-100 z-0" />
                )}
                {filteredLogs.map((log) => {
                  const isUserAdmin = log.profiles?.role === 'admin';
                  return (
                    <div key={log.id} className="flex gap-4 items-start relative bg-white pb-1">
                      {/* Ikona zależna od roli */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border bg-white transition-all duration-300 relative z-10 ${
                        isUserAdmin
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        {isUserAdmin ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>

                      {/* Treść zdarzenia */}
                      <div className="flex-1 min-w-0 relative z-10">
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
                                {log.details.details && <span className="mr-2">{log.details.details}</span>}
                                {log.details.visit_type && <span className="mr-2">Usługa: {log.details.visit_type}</span>}
                                {log.details.client_name && <span className="mr-2">Pacjent: {log.details.client_name}</span>}
                                {log.details.email && <span>E-mail: {log.details.email}</span>}
                              </>
                            ) : (
                              JSON.stringify(log.details)
                            )}
                          </p>
                        )}
                      </div>

                      {/* Czas zdarzenia */}
                      <div className="text-[10px] text-gray-400 whitespace-nowrap relative z-10">
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

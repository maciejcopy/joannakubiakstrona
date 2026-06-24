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
            <div className="group relative bg-white border border-[#C4DEBE]/35 border-l-4 border-l-blue-500 p-6 rounded-2xl cursor-help transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Liczba rezerwacji</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalBookings}</p>
              <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 transition-colors duration-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Całkowita liczba rezerwacji (oczekujących, potwierdzonych, zrealizowanych i anulowanych) zarejestrowanych w systemie.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Karta 2 */}
            <div className="group relative bg-white border border-[#C4DEBE]/35 border-l-4 border-l-emerald-500 p-6 rounded-2xl cursor-help transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Potwierdzone wizyty</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.confirmedBookings}</p>
              <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 transition-colors duration-300">
                <CheckCircle className="h-5 w-5" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg text-center leading-relaxed">
                Liczba wizyt o statusie "Potwierdzona", które zostały zatwierdzone przez gabinet.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Karta 3 */}
            <div className="group relative bg-white border border-[#C4DEBE]/35 border-l-4 border-l-purple-500 p-6 rounded-2xl cursor-help transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Aktywni Klienci</span>
              <p className="text-3xl font-serif font-bold text-[#2F5C3A] mt-2">{stats.totalClients}</p>
              <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 transition-colors duration-300">
                <Users className="h-5 w-5" />
              </div>
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
                  <thead className="bg-gray-50/75">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Klient</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usługa</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => navigate(`/panel/admin/bookings/${booking.id}`)}
                        className="cursor-pointer hover:bg-[#F6FAF4]/70 transition-colors"
                      >
                        <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-[#C4DEBE]/40 text-xs font-bold text-[#2F5C3A] flex items-center justify-center flex-shrink-0">
                              {(booking.profiles?.full_name || 'Klient offline').charAt(0).toUpperCase()}
                            </div>
                            <span className="flex items-center">
                              {booking.profiles?.full_name || 'Klient offline'}
                              {booking.is_first_visit && (
                                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  1sza wizyta
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-600">
                          {booking.visit_types?.title}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-600">
                          {new Date(booking.scheduled_at).toLocaleString('pl-PL')}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border transition-all duration-300 ${
                            booking.booking_statuses?.name === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : booking.booking_statuses?.name === 'completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : booking.booking_statuses?.name === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
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
                      className={`px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                        activityFilter === type
                          ? 'bg-[#2F5C3A] text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {type === 'all' ? 'Wszystkie' : type === 'user' ? 'Pacjenci' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista aktywności (Timeline) */}
              <div 
                className="relative space-y-6 max-h-[400px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#C4DEBE #F6FAF4'
                }}
              >
                {/* Pionowa linia czasu łącząca ikony */}
                {filteredLogs.length > 1 && (
                  <div className="absolute left-4 top-2 bottom-8 w-[1px] border-l border-dashed border-gray-200 z-0" />
                )}
                {filteredLogs.map((log) => {
                  const isUserAdmin = log.profiles?.role === 'admin';
                  return (
                    <div key={log.id} className="flex gap-4 items-start relative bg-white pb-1">
                      {/* Ikona zależna od roli */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 relative z-10 ${
                        isUserAdmin
                          ? 'bg-purple-50 border-purple-100 text-purple-600 shadow-sm'
                          : 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm'
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
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isUserAdmin 
                              ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {isUserAdmin ? 'Admin' : 'Pacjent'}
                          </span>
                        </p>
                        {log.details && (
                          <div className="text-xs text-gray-500 mt-2 bg-gray-50/70 border border-gray-100/70 rounded-xl p-2.5 font-medium leading-relaxed">
                            {log.details.details || log.details.visit_type || log.details.client_name || log.details.email ? (
                              <div className="flex flex-col gap-0.5">
                                {log.details.details && <div>{log.details.details}</div>}
                                {log.details.visit_type && <div><span className="text-gray-400">Usługa:</span> {log.details.visit_type}</div>}
                                {log.details.client_name && <div><span className="text-gray-400">Pacjent:</span> {log.details.client_name}</div>}
                                {log.details.email && <div><span className="text-gray-400">E-mail:</span> {log.details.email}</div>}
                              </div>
                            ) : (
                              <span className="font-mono text-[10px] break-all">{JSON.stringify(log.details)}</span>
                            )}
                          </div>
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

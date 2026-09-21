import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { adminSidebarItems } from '../../../config/sidebarConfig';

interface ProfileItem {
  id: string;
  full_name: string;
  email: string | null;
  phone_prefix: string;
  phone_number: string;
  city: string | null;
  role: string;
  created_at: string;
}

export const AdminKlienci: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['client', 'user'])
          .order('full_name');

        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.phone_number?.includes(searchTerm)
  );

  return (
    <PanelLayout title="Kartoteka Klientów" role="admin" sidebarItems={adminSidebarItems}>
      <div className="space-y-6">
        {/* Wyszukiwarka */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Szukaj po nazwisku, e-mailu lub telefonie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A]"
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Imię i Nazwisko</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Miasto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rola</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProfiles.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/panel/admin/clients/${p.id}`)}
                    className="cursor-pointer hover:bg-[#F6FAF4]/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {p.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.email || <span className="text-gray-400 italic">Offline (Brak)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.phone_prefix} {p.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.city || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition duration-300 ${
                        p.role === 'client'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                          : p.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200/50'
                          : 'bg-blue-50 text-blue-700 border-blue-200/50'
                      }`}>
                        {p.role === 'client' ? 'Stały Klient' : p.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredProfiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nie znaleziono żadnych pacjentów.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

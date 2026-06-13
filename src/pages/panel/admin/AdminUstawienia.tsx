import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { toast } from 'react-hot-toast';

interface AppSetting {
  key: string;
  value: {
    limit?: number;
    unit?: string;
    requirePhone?: boolean;
  };
  description: string;
}

export const AdminUstawienia: React.FC = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [bookingLimit, setBookingLimit] = useState(4);
  const [bookingUnit, setBookingUnit] = useState('weeks');
  const [requirePhone, setRequirePhone] = useState(true);

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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;
      setSettings(data || []);

      // Przypisz stany
      const limitSetting = data?.find(s => s.key === 'advance_booking_limit');
      if (limitSetting) {
        setBookingLimit(limitSetting.value.limit || 4);
        setBookingUnit(limitSetting.value.unit || 'weeks');
      }

      const rulesSetting = data?.find(s => s.key === 'booking_validation_rules');
      if (rulesSetting) {
        setRequirePhone(rulesSetting.value.requirePhone ?? true);
      }

    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const { error: err1 } = await supabase
        .from('app_settings')
        .update({
          value: { limit: bookingLimit, unit: bookingUnit },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'advance_booking_limit');

      const { error: err2 } = await supabase
        .from('app_settings')
        .update({
          value: { requirePhone: requirePhone },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'booking_validation_rules');

      if (err1 || err2) throw err1 || err2;

      toast.success('Ustawienia zapisane pomyślnie!');
      fetchSettings();
    } catch (err: any) {
      toast.error('Błąd podczas zapisywania: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelLayout title="Globalne Ustawienia Aplikacji" role="admin" sidebarItems={sidebarItems}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-lg">
          
          <div className="space-y-4">
            <h3 className="text-md font-serif font-bold text-[#2F5C3A] border-b border-gray-100 pb-2">Rezerwacje</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Maks. wyprzedzenie rezerwacji</label>
                <input
                  type="number"
                  value={bookingLimit}
                  onChange={(e) => setBookingLimit(Number(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jednostka</label>
                <select
                  value={bookingUnit}
                  onChange={(e) => setBookingUnit(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="days">Dni</option>
                  <option value="weeks">Tygodni</option>
                  <option value="months">Miesięcy</option>
                </select>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">Określa, na jak daleko w przyszłość pacjent może rezerwować terminy wizyt.</p>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-md font-serif font-bold text-[#2F5C3A] border-b border-gray-100 pb-2">Walidacja</h3>
            
            <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={requirePhone}
                onChange={(e) => setRequirePhone(e.target.checked)}
                className="text-[#2F5C3A] focus:ring-[#2F5C3A] rounded"
              />
              Wymagaj numeru telefonu przy rezerwacji
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-medium rounded-xl transition duration-300 shadow-soft"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </button>
          </div>

        </form>
      )}
    </PanelLayout>
  );
};

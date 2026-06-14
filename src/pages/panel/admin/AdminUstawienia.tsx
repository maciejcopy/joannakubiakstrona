import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { toast } from 'react-hot-toast';
import { adminSidebarItems } from '../../../config/sidebarConfig';

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
    <PanelLayout title="Globalne Ustawienia Aplikacji" role="admin" sidebarItems={adminSidebarItems}>
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

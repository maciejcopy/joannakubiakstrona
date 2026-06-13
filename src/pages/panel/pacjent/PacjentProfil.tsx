import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';

export const PacjentProfil: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState('');
  
  // Pola formularza
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+48');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [add1, setAdd1] = useState('');
  const [add2, setAdd2] = useState('');
  const [postCode, setPostCode] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [country, setCountry] = useState('Polska');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfileId(data.id);
          setFullName(data.full_name || '');
          setPhonePrefix(data.phone_prefix || '+48');
          setPhoneNumber(data.phone_number || '');
          setAdd1(data.add1 || '');
          setAdd2(data.add2 || '');
          setPostCode(data.post_code || '');
          setCity(data.city || '');
          setCounty(data.county || '');
          setCountry(data.country || 'Polska');
        }
      } catch (err: any) {
        console.error('Błąd pobierania profilu:', err);
        setErrorMsg('Nie udało się pobrać danych profilowych.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_prefix: phonePrefix,
          phone_number: phoneNumber,
          add1,
          add2,
          post_code: postCode,
          city,
          county,
          country
        })
        .eq('id', profileId);

      if (error) throw error;
      setSuccessMsg('Profil został pomyślnie zaktualizowany.');
    } catch (err: any) {
      console.error('Błąd zapisu profilu:', err);
      setErrorMsg(err.message || 'Wystąpił błąd podczas zapisywania zmian.');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <PanelLayout title="Mój Profil" role="pacjent" sidebarItems={sidebarItems}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-[#2F5C3A] px-4 py-3 rounded-xl text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Numer telefonu</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="w-20 px-3 py-2.5 border border-gray-300 rounded-xl text-center sm:text-sm"
                />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kraj</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Ulica, numer domu i mieszkania (Adres 1)</label>
              <input
                type="text"
                required
                value={add1}
                onChange={(e) => setAdd1(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
                placeholder="np. Jasna 12 m. 4"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dodatkowe dane adresowe (Adres 2 - opcjonalnie)</label>
              <input
                type="text"
                value={add2}
                onChange={(e) => setAdd2(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kod pocztowy</label>
              <input
                type="text"
                required
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
                placeholder="00-000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Miasto</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Województwo / Powiat (opcjonalnie)</label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-medium rounded-xl transition duration-300 shadow-soft"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      )}
    </PanelLayout>
  );
};

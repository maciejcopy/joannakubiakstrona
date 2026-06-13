import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Form fields
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
  const navigate = useNavigate();

  const loadSignedAvatar = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(path, 60 * 60); // 1 hour
      if (error) throw error;
      if (data) {
        setAvatarUrl(data.signedUrl);
      }
    } catch (err) {
      console.error('Error loading signed avatar:', err);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/login');
          return;
        }

        setEmail(session.user.email || '');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', session.user.id)
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
          setRole(data.role || 'user');
          
          if (data.avatar_url) {
            await loadSignedAvatar(data.avatar_url);
          }
        }
      } catch (err: any) {
        console.error('Błąd wczytywania profilu:', err);
        setErrorMsg('Nie udało się wczytać danych profilu.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Wybrany plik musi być zdjęciem.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Brak aktywnej sesji.');

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/avatar_${Date.now()}.${fileExt}`;

      // Upload file to the 'avatars' bucket
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Update user profile record in profiles
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', profileId);

      if (dbErr) throw dbErr;

      await loadSignedAvatar(filePath);
      setSuccessMsg('Zdjęcie profilowe zostało zaktualizowane.');
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setErrorMsg(err.message || 'Wystąpił błąd podczas wgrywania zdjęcia.');
    } finally {
      setUploading(false);
    }
  };

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

  const handleGoBack = () => {
    if (role === 'admin') {
      navigate('/panel/admin/dashboard');
    } else {
      navigate('/panel/pacjent/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAF4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-soft border border-[#C4DEBE]/35 overflow-hidden">
        {/* Header */}
        <div className="bg-[#2F5C3A] text-white px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold">Mój Profil</h1>
            <p className="text-sm text-[#C4DEBE]">Zarządzaj swoimi danymi osobowymi i kontaktowymi</p>
          </div>
          <button 
            type="button"
            onClick={handleGoBack}
            className="text-sm text-[#C4DEBE] hover:text-white transition duration-300 font-semibold"
          >
            ← Powrót do panelu
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
            </div>
          ) : (
            <div className="space-y-6">
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

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                <div className="relative group h-24 w-24">
                  <div className="h-24 w-24 rounded-full bg-[#C4DEBE]/40 flex items-center justify-center font-bold text-4xl text-[#2F5C3A] shadow-soft overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Zdjęcie profilowe" className="h-full w-full object-cover" />
                    ) : (
                      fullName ? fullName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  
                  {/* Upload button with camera icon in bottom-right */}
                  <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#2F5C3A] hover:bg-[#3A8BA8] border-2 border-white flex items-center justify-center text-white cursor-pointer shadow transition duration-300">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-serif font-bold text-[#2F5C3A]">{fullName || 'Użytkownik'}</h2>
                  <p className="text-sm text-gray-500">Rola w systemie: <span className="capitalize font-semibold text-gray-700">{role === 'admin' ? 'Administrator' : role === 'client' ? 'Stały Klient' : 'Użytkownik'}</span></p>
                  <p className="text-xs text-gray-400">{email}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm transition duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Numer telefonu</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                        className="w-20 px-3 py-2.5 border border-gray-300 rounded-xl text-center sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A]"
                      />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
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
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Ulica, numer domu i mieszkania (Adres 1)</label>
                    <input
                      type="text"
                      required
                      value={add1}
                      onChange={(e) => setAdd1(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
                      placeholder="np. Jasna 12 m. 4"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Dodatkowe dane adresowe (Adres 2 - opcjonalnie)</label>
                    <input
                      type="text"
                      value={add2}
                      onChange={(e) => setAdd2(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kod pocztowy</label>
                    <input
                      type="text"
                      required
                      value={postCode}
                      onChange={(e) => setPostCode(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
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
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Województwo / Powiat (opcjonalnie)</label>
                    <input
                      type="text"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] sm:text-sm transition duration-300"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition duration-300"
                  >
                    Powrót
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-medium rounded-xl transition duration-300 shadow-soft"
                  >
                    {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

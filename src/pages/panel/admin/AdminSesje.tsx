import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';

interface VisitType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
}

export const AdminSesje: React.FC = () => {
  const [sessions, setSessions] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<VisitType | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150);
  const [duration, setDuration] = useState(50);
  const [isActive, setIsActive] = useState(true);

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
    }
  ];

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visit_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenAdd = () => {
    setEditingSession(null);
    setTitle('');
    setDescription('');
    setPrice(150);
    setDuration(50);
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (session: VisitType) => {
    setEditingSession(session);
    setTitle(session.title);
    setDescription(session.description);
    setPrice(session.price);
    setDuration(session.duration);
    setIsActive(session.is_active);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSession) {
        // Edit mode
        const { error } = await supabase
          .from('visit_types')
          .update({ title, description, price, duration, is_active: isActive })
          .eq('id', editingSession.id);

        if (error) throw error;
        alert('Usługa została zaktualizowana!');
      } else {
        // Create mode
        const { error } = await supabase
          .from('visit_types')
          .insert({ title, description, price, duration, is_active: isActive });

        if (error) throw error;
        alert('Dodano nową usługę!');
      }
      setShowModal(false);
      fetchSessions();
    } catch (err: any) {
      alert('Wystąpił błąd: ' + err.message);
    }
  };

  return (
    <PanelLayout title="Zarządzanie sesjami / usługami" role="admin" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-4">
          <p className="text-sm text-gray-500">Definiuj typy sesji psychologicznych, ich ceny oraz czas trwania.</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white font-medium rounded-xl transition duration-300 flex items-center gap-2 text-sm shadow-soft"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Dodaj nowy typ sesji
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map(s => (
              <div
                key={s.id}
                className={`border rounded-2xl p-6 transition duration-300 ${
                  s.is_active ? 'border-[#C4DEBE]/40 bg-white' : 'border-gray-200 bg-gray-50/50 opacity-70'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    s.is_active
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {s.is_active ? 'Aktywna' : 'Nieaktywna'}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="text-sm text-[#48A7C9] hover:underline font-semibold"
                  >
                    Edytuj
                  </button>
                </div>
                <h4 className="font-serif font-bold text-lg text-[#2F5C3A] mb-2">{s.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{s.description || 'Brak opisu.'}</p>
                <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500 font-semibold">
                  <span>Czas: {s.duration} min</span>
                  <span className="text-gray-800">{s.price} zł</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-gray-500 col-span-2 text-center py-12">Brak zdefiniowanych sesji.</p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-[#2F5C3A]">
                {editingSession ? 'Edytuj typ sesji' : 'Dodaj nowy typ sesji'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nazwa usługi</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm"
                  placeholder="np. Konsultacja indywidualna"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Opis usługi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm h-24"
                  placeholder="Wpisz krótki opis usługi widoczny dla pacjenta..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cena (zł)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Czas trwania (min)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="text-[#2F5C3A] focus:ring-[#2F5C3A] rounded"
                  />
                  Usługa jest aktywna (widoczna dla pacjentów)
                </label>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 text-white rounded-xl text-sm font-semibold transition shadow-soft"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { PanelLayout } from '../../../components/PanelLayout';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { adminSidebarItems } from '../../../config/sidebarConfig';

interface VisitType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
  cal_slug?: string;
}

export const AdminSesje: React.FC = () => {
  const [sessions, setSessions] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<VisitType | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150);
  const [duration, setDuration] = useState(50);
  const [isActive, setIsActive] = useState(true);
  const [calSlug, setCalSlug] = useState('');

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
    setCalSlug('');
    setShowModal(true);
  };

  const handleOpenEdit = (session: VisitType) => {
    setEditingSession(session);
    setTitle(session.title);
    setDescription(session.description);
    setPrice(session.price);
    setDuration(session.duration);
    setIsActive(session.is_active);
    setCalSlug(session.cal_slug || '');
    setShowModal(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Jeśli edytujemy i wyłączamy aktywność usługi, a modal nie jest potwierdzony
    if (editingSession && editingSession.is_active && !isActive && !isConfirmOpen) {
      setIsConfirmOpen(true);
      return;
    }

    try {
      if (editingSession) {
        // Edit mode
        const { error } = await supabase
          .from('visit_types')
          .update({ title, description, price, duration, is_active: isActive, cal_slug: calSlug })
          .eq('id', editingSession.id);

        if (error) throw error;
        toast.success('Usługa została zaktualizowana!');
      } else {
        // Create mode
        const { error } = await supabase
          .from('visit_types')
          .insert({ title, description, price, duration, is_active: isActive, cal_slug: calSlug });

        if (error) throw error;
        toast.success('Dodano nową usługę!');
      }
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      const error = err as Error;
      toast.error('Wystąpił błąd: ' + error.message);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  return (
    <PanelLayout title="Zarządzanie sesjami / usługami" role="admin" sidebarItems={adminSidebarItems}>
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
                {s.cal_slug && (
                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <span className="font-bold">Cal.com Slug:</span> {s.cal_slug}
                  </p>
                )}
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
                <label className="block text-sm font-medium text-gray-700">Cal.com Event Slug</label>
                <input
                  type="text"
                  value={calSlug}
                  onChange={(e) => setCalSlug(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm"
                  placeholder="np. konsultacja-indywidualna"
                />
                <p className="text-[10px] text-gray-400 mt-1">Końcówka adresu URL Twojego wydarzenia z konta Cal.com.</p>
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Deaktywacja usługi"
        message={`Czy na pewno chcesz deaktywować usługę "${title}"? Pacjenci nie będą mogli jej rezerwować.`}
        confirmLabel="Tak, deaktywuj"
        cancelLabel="Wróć"
        type="danger"
        onConfirm={() => handleSubmit()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </PanelLayout>
  );
};

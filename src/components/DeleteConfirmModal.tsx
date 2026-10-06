import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  count?: number;
  itemDescription?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Trwałe usunięcie rezerwacji',
  description,
  count = 1,
  itemDescription,
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');

  // Blokowanie przewijania strony przy otwartym modalu oraz reset stanu przy zamknięciu
  useEffect(() => {
    if (isOpen) {
      setInputText('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Sprawdzenie wpisanego słowa "usuń" (case-insensitive)
  const isWordMatch = inputText.trim().toLowerCase() === 'usuń';

  const defaultDescription =
    count > 1
      ? `Zamierzasz trwale usunąć ${count} wybranych wizyt z bazy danych.`
      : 'Zamierzasz trwale usunąć tę rezerwację z bazy danych.';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-100 transform transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
          {description || defaultDescription}
        </p>

        {itemDescription && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-700 mb-3 border border-gray-100">
            {itemDescription}
          </div>
        )}

        <div className="p-3.5 bg-red-50/80 rounded-2xl border border-red-200 text-xs text-red-800 mb-5 leading-relaxed font-medium">
          ⚠️ <strong>Operacja jest nieodwracalna.</strong> Dane zostaną trwale skasowane z systemu i nie będzie możliwości ich przywrócenia.
        </div>

        <div className="mb-6 space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Wpisz słowo <span className="text-red-600 font-bold uppercase tracking-wider">usuń</span>, aby potwierdzić:
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isDeleting}
            placeholder='Wpisz "usuń"'
            autoFocus
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isWordMatch || isDeleting}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Usuwanie...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Usuń trwale
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

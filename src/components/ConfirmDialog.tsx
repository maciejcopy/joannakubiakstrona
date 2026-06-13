import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'success' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  onConfirm,
  onCancel,
  type = 'danger',
}) => {
  // Zablokowanie przewijania strony pod modalem
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: 'bg-red-50 text-[#B4453A]',
      btnBg: 'bg-[#B4453A] hover:bg-[#B4453A]/90 focus:ring-red-500',
    },
    success: {
      iconBg: 'bg-green-50 text-[#2F5C3A]',
      btnBg: 'bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 focus:ring-[#2F5C3A]',
    },
    info: {
      iconBg: 'bg-blue-50 text-[#48A7C9]',
      btnBg: 'bg-[#48A7C9] hover:bg-[#48A7C9]/90 focus:ring-[#48A7C9]',
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center">
          {/* Ikona ostrzeżenia/akcji */}
          <div className={`h-14 w-14 rounded-full ${styles.iconBg} flex items-center justify-center mb-4 shadow-sm`}>
            {type === 'danger' && (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === 'success' && (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'info' && (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>

          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 text-white rounded-xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.btnBg}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

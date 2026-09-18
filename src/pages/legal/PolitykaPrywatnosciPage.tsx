import React, { useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

export const PolitykaPrywatnosciPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      title="Polityka Prywatności i Plików Cookies"
      subtitle="Zasady przetwarzania danych osobowych (RODO) oraz wykorzystywania plików cookies w serwisie"
      lastUpdated="[TUTAJ_DATA]"
      icon="shield"
    >
      {/* ================================================================================= */}
      {/* TUTAJ ZOSTANIE WKLEJONA CAŁA TREŚĆ POLITYKI PRYWATNOŚCI DOSTARCZONA PRZEZ UŻYTKOWNIKA */}
      {/* ================================================================================= */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-6 sm:p-8 text-amber-900 text-sm leading-relaxed">
        <p className="font-semibold text-amber-950 mb-1">Miejsce na treść polityki prywatności</p>
        <p>Treść polityki prywatności jest w trakcie przygotowania i zostanie wkrótce opublikowana.</p>
      </div>
    </LegalLayout>
  );
};

export default PolitykaPrywatnosciPage;

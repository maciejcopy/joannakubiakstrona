import React, { useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

export const RegulaminPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      title="Regulamin świadczenia usług i rezerwacji wizyt"
      subtitle="Zasady świadczenia usług psychologicznych drogą elektroniczną oraz stacjonarnie w gabinecie"
      lastUpdated="[TUTAJ_DATA]"
      icon="file"
    >
      {/* ========================================================================= */}
      {/* TUTAJ ZOSTANIE WKLEJONA CAŁA TREŚĆ REGULAMINU DOSTARCZONA PRZEZ UŻYTKOWNIKA */}
      {/* ========================================================================= */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-6 sm:p-8 text-amber-900 text-sm leading-relaxed">
        <p className="font-semibold text-amber-950 mb-1">Miejsce na treść regulaminu</p>
        <p>Treść regulaminu jest w trakcie przygotowania i zostanie wkrótce opublikowana.</p>
      </div>
    </LegalLayout>
  );
};

export default RegulaminPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface VisitType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
}

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Dane pacjenta
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+48');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchVisitTypes() {
      try {
        const { data, error } = await supabase
          .from('visit_types')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setVisitTypes(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisitTypes();
  }, []);

  const handleSelectService = (service: VisitType) => {
    setSelectedVisitType(service);
    setStep(2);
  };

  const handleSelectDateTime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    // Rezerwacja zostanie zaimplementowana w panelu w kolejnym kroku
    alert('Rezerwacja wysłana! Szczegółowa logika rezerwacji zostanie dołączona w kolejnych etapach.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F6FAF4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-soft border border-[#C4DEBE]/30 overflow-hidden">
        {/* Header */}
        <div className="bg-[#2F5C3A] text-white px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold">Kreator Rezerwacji Wizyty</h1>
            <p className="text-sm text-[#C4DEBE]">Wygodnie zarezerwuj termin sesji psychologicznej</p>
          </div>
          <Link to="/" className="text-sm text-[#C4DEBE] hover:text-white transition duration-300">
            ← Powrót do strony
          </Link>
        </div>

        {/* Multi-step progress bar */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <div className={`flex-1 text-center py-4 text-xs font-semibold ${step === 1 ? 'text-[#2F5C3A] border-b-2 border-[#2F5C3A]' : 'text-gray-400'}`}>
            1. Wybór usługi
          </div>
          <div className={`flex-1 text-center py-4 text-xs font-semibold ${step === 2 ? 'text-[#2F5C3A] border-b-2 border-[#2F5C3A]' : 'text-gray-400'}`}>
            2. Wybór terminu
          </div>
          <div className={`flex-1 text-center py-4 text-xs font-semibold ${step === 3 ? 'text-[#2F5C3A] border-b-2 border-[#2F5C3A]' : 'text-gray-400'}`}>
            3. Dane i podsumowanie
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2F5C3A] mb-6">Jakiej pomocy potrzebujesz?</h2>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2F5C3A]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visitTypes.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className="border border-gray-200 hover:border-[#2F5C3A] hover:bg-[#F6FAF4]/30 rounded-2xl p-6 cursor-pointer transition duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#2F5C3A] mb-2">{service.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{service.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-500">Czas: {service.duration} min</span>
                        <span className="font-serif font-bold text-[#48A7C9]">{service.price} zł</span>
                      </div>
                    </div>
                  ))}
                  {visitTypes.length === 0 && (
                    <p className="text-gray-500 col-span-2 text-center py-12">Brak zdefiniowanych aktywnych usług.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2F5C3A] mb-6">Wybierz dogodny termin</h2>
              <p className="text-sm text-gray-600 mb-6">
                Wybrana usługa: <strong className="text-[#2F5C3A]">{selectedVisitType?.title}</strong>
              </p>
              
              {/* Dynamiczny kalendarz zostanie wdrożony w kolejnych krokach */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <p className="text-sm text-gray-500 mb-4">Wybierz przykładowy termin testowy:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleSelectDateTime('2026-06-15', '09:00')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#2F5C3A] hover:bg-[#F6FAF4]/50 transition duration-300 text-sm font-medium text-[#2F5C3A]"
                  >
                    15 Czerwca (Poniedziałek), 09:00
                  </button>
                  <button
                    onClick={() => handleSelectDateTime('2026-06-15', '11:30')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#2F5C3A] hover:bg-[#F6FAF4]/50 transition duration-300 text-sm font-medium text-[#2F5C3A]"
                  >
                    15 Czerwca (Poniedziałek), 11:30
                  </button>
                  <button
                    onClick={() => handleSelectDateTime('2026-06-16', '14:00')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#2F5C3A] hover:bg-[#F6FAF4]/50 transition duration-300 text-sm font-medium text-[#2F5C3A]"
                  >
                    16 Czerwca (Wtorek), 14:00
                  </button>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                >
                  Wstecz
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmitBooking}>
              <h2 className="text-xl font-serif font-bold text-[#2F5C3A] mb-6">Uzupełnij swoje dane kontaktowe</h2>
              
              <div className="bg-[#F6FAF4]/50 border border-[#C4DEBE]/35 rounded-2xl p-6 mb-6">
                <h3 className="font-serif font-bold text-[#2F5C3A] mb-2 text-sm">Podsumowanie wyboru:</h3>
                <ul className="text-sm space-y-1.5 text-gray-700">
                  <li>Usługa: <strong>{selectedVisitType?.title}</strong> ({selectedVisitType?.price} zł)</li>
                  <li>Termin: <strong>{selectedDate} o godzinie {selectedTime}</strong></li>
                </ul>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Imię i nazwisko</label>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numer telefonu</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className="w-20 px-3 py-2.5 border border-gray-300 rounded-xl text-center sm:text-sm"
                    />
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F5C3A] focus:border-[#2F5C3A] sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                >
                  Wstecz
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-[#2F5C3A] hover:bg-[#2F5C3A]/90 transition duration-300 shadow-soft"
                >
                  Potwierdź rezerwację
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

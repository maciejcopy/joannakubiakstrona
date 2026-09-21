import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  id?: string;
  name?: string;
  value: string; // Format 'YYYY-MM-DD'
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  className?: string;
  disabled?: boolean;
}

const POLISH_MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

const POLISH_MONTHS_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

const DAYS_OF_WEEK = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  value,
  onChange,
  required,
  placeholder = 'Wybierz datę...',
  minDate = '1920-01-01',
  maxDate,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsuj początkowy rok i miesiąc z `value` lub ustaw na 18 lat temu (dla łatwego wyboru urodzin)
  const getInitialYearAndMonth = () => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { year: parts[0], month: parts[1] - 1 };
      }
    }
    if (maxDate) {
      const parts = maxDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { year: parts[0], month: parts[1] - 1 };
      }
    }
    const defaultYear = new Date().getFullYear() - 18;
    return { year: defaultYear, month: 0 };
  };

  const initial = getInitialYearAndMonth();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // Synchronizuj widok z wartością, gdy użytkownik wybierze nową
  useEffect(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [value]);

  // Zamknij kalendarz przy kliknięciu poza komponent
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Oblicz lata do wyboru w dropdownie
  const minYear = minDate ? parseInt(minDate.split('-')[0], 10) : 1920;
  const maxYear = maxDate ? parseInt(maxDate.split('-')[0], 10) : new Date().getFullYear();
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Oblicz dni w danym miesiącu
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Dzień tygodnia pierwszego dnia miesiąca (0 = Niedziela, 1 = Poniedziałek)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Przelicz na Poniedziałek = 0 ... Niedziela = 6
  const startDayOffset = (firstDayIndex + 6) % 7;

  // Dni z poprzedniego miesiąca do dopełnienia siatki
  const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const isDateDisabled = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const handleSelectDay = (day: number) => {
    if (isDateDisabled(viewYear, viewMonth, day)) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Formatowanie wyświetlanej wartości
  const formatDisplayValue = (val: string) => {
    if (!val) return '';
    const parts = val.split('-').map(Number);
    if (parts.length === 3) {
      const day = parts[2];
      const monthName = POLISH_MONTHS_GENITIVE[parts[1] - 1];
      const year = parts[0];
      if (monthName) {
        return `${day} ${monthName} ${year}`;
      }
      return `${String(day).padStart(2, '0')}.${String(parts[1]).padStart(2, '0')}.${year}`;
    }
    return val;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Niewidoczne pole dla integracji z formularzem HTML */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value}
        required={required}
      />

      {/* Stylizowany przycisk wyzwalający */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }
        }}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-sm cursor-pointer transition-all duration-200 outline-none
          ${isOpen ? 'ring-2 ring-[#2F5C3A] border-[#2F5C3A]' : 'hover:border-gray-400'}
          ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
        `}
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {value ? formatDisplayValue(value) : placeholder}
        </span>

        <div className="flex items-center gap-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              title="Wyczyść datę"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <CalendarIcon className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#2F5C3A]' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Rozwijane okienko nowoczesnego kalendarza */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-full min-w-[300px] sm:min-w-[320px] bg-white rounded-2xl shadow-2xl border border-[#C4DEBE]/60 p-4 transition-all animate-in fade-in zoom-in-95 duration-150">
          {/* Górny pasek kontrolny: miesiąc, rok, strzałki */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-[#F6FAF4] hover:text-[#2F5C3A] transition"
              title="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Wybór miesiąca */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-[#F6FAF4] text-[#2F5C3A] font-semibold text-xs sm:text-sm py-1 px-2 rounded-lg border border-[#C4DEBE]/50 focus:outline-none focus:ring-1 focus:ring-[#2F5C3A] cursor-pointer"
              >
                {POLISH_MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Wybór roku */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-[#F6FAF4] text-[#2F5C3A] font-semibold text-xs sm:text-sm py-1 px-2 rounded-lg border border-[#C4DEBE]/50 focus:outline-none focus:ring-1 focus:ring-[#2F5C3A] cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-[#F6FAF4] hover:text-[#2F5C3A] transition"
              title="Następny miesiąc"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dni tygodnia */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Siatka dni miesiąca */}
          <div className="grid grid-cols-7 gap-1">
            {/* Dni z poprzedniego miesiąca (nieaktywne) */}
            {Array.from({ length: startDayOffset }).map((_, i) => {
              const dayNum = prevMonthDaysCount - startDayOffset + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-9 flex items-center justify-center text-xs text-gray-300 font-medium select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Dni bieżącego miesiąca */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isDisabled = isDateDisabled(viewYear, viewMonth, day);

              return (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 w-full rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-center
                    ${isSelected 
                      ? 'bg-[#2F5C3A] text-white font-bold shadow-md shadow-[#2F5C3A]/25 scale-105' 
                      : isDisabled
                      ? 'text-gray-300 cursor-not-allowed opacity-40'
                      : 'text-gray-700 hover:bg-[#F6FAF4] hover:text-[#2F5C3A]'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Dolny pasek informacyjny */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="text-[11px] text-gray-400">
              {maxDate ? 'Wymagane ukończone 18 lat' : ''}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#2F5C3A] font-medium hover:underline px-2 py-1 rounded"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

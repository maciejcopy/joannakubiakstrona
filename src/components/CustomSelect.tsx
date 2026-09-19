import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  id: string;
  label: string;
  name?: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  getBadgeColor?: (item: SelectOption) => string | undefined;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Wybierz...',
  className = '',
  disabled = false,
  getBadgeColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

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

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Przycisk otwierający rozwijane menu */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all duration-200 outline-none text-left shadow-2xs
          ${
            isOpen
              ? 'border-[#2F5C3A] ring-2 ring-[#2F5C3A]/20 shadow-sm'
              : 'border-gray-200 hover:border-gray-300'
          }
          ${disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption && getBadgeColor && (
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                getBadgeColor(selectedOption) || 'bg-gray-400'
              }`}
            />
          )}
          <span className={selectedOption ? 'font-medium text-gray-800' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-[#2F5C3A]' : ''
          }`}
        />
      </button>

      {/* Menu rozwijane */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-[#C4DEBE]/50 py-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-gray-400 text-center">Brak opcji do wyboru</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.id === value;
              const badgeColor = getBadgeColor ? getBadgeColor(opt) : undefined;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition duration-150 text-left
                    ${
                      isSelected
                        ? 'bg-[#F6FAF4] text-[#2F5C3A] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {badgeColor && (
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${badgeColor}`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#2F5C3A] shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

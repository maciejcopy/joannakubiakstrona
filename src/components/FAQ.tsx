import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { FAQ_DATA, FAQItem } from '../config/faqData';

interface FAQProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  limit?: number;
}

export default function FAQ({
  items = FAQ_DATA,
  title = 'Najczęściej zadawane pytania',
  subtitle = 'Wszystko, co warto wiedzieć przed pierwszą wizytą, o przebiegu konsultacji oraz pomocy psychologicznej dla dzieci i młodzieży.',
  className = '',
  limit,
}: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  const [showAll, setShowAll] = useState(false);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const displayedItems = limit && !showAll ? items.slice(0, limit) : items;

  return (
    <section id="faq" className={`py-20 lg:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header sekcji */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-green/20 text-dark-green text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4 text-light-green" />
              <span>FAQ & Strefa Wiedzy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-green mb-4 text-balance">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
              {subtitle}
            </p>
          </div>

          {/* Lista pytań i odpowiedzi (Accordion) */}
          <div className="space-y-4">
            {displayedItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-2xl overflow-hidden bg-warm-beige/30 transition-all duration-300 hover:border-pastel-blue/40 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pastel-blue"
                  >
                    <span className="text-lg font-semibold text-dark-green flex-grow text-pretty">
                      {item.question}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'bg-pastel-blue text-white rotate-180' : 'bg-white text-dark-green shadow-xs'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${item.id}`}
                      className="px-6 pb-6 sm:px-7 sm:pb-7 text-gray-700 leading-relaxed border-t border-gray-100/60 pt-4"
                    >
                      {/* Bezpośrednia krótka odpowiedź AEO */}
                      <div className="p-4 rounded-xl bg-white border border-light-green/20 mb-4 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-pastel-blue flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-dark-green text-sm mb-0.5">W skrócie:</p>
                          <p className="text-gray-800 text-sm">{item.shortAnswer}</p>
                        </div>
                      </div>

                      {/* Pełna merytoryczna odpowiedź */}
                      <p className="text-base text-gray-600 leading-relaxed">
                        {item.fullAnswer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Przycisk rozwijania pozostałych pytań */}
          {limit && items.length > limit && (
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-warm-beige text-dark-green font-medium hover:bg-light-green/20 transition-colors duration-200 border border-dark-green/10"
              >
                <span>{showAll ? 'Pokaż mniej pytań' : `Zobacz wszystkie pytania (${items.length})`}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

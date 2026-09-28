export interface FAQItem {
  id: string;
  question: string;
  shortAnswer: string;
  fullAnswer: string;
  category?: 'wizyta' | 'terapia' | 'organizacyjne';
}

/**
 * Baza pytań i odpowiedzi FAQ zoptymalizowana pod kątem AEO (Answer Engine Optimization)
 * oraz GEO (Generative Engine Optimization dla LLM-ów).
 *
 * Zasada formatowania AEO:
 * - `shortAnswer`: Bezpośrednia, 1-2 zdaniowa odpowiedź (idealna pod Google Featured Snippet i asystentów głosowych).
 * - `fullAnswer`: Wyczerpujące rozwinięcie merytoryczne z zachowaniem kontekstu praktycznego.
 */
export const FAQ_DATA: FAQItem[] = [
  {
    id: 'pierwsza-wizyta',
    category: 'wizyta',
    question: 'Jak wygląda pierwsza wizyta u psychologa dziecięcego?',
    shortAnswer:
      'Pierwsza wizyta to konsultacja wstępna, podczas której omawiamy problem, z którym przychodzisz, zbieramy wywiad rozwojowy i wspólnie ustalamy cele oraz plan dalszej współpracy.',
    fullAnswer:
      'Pierwsza wizyta ma charakter konsultacji wstępnej i zapoznawczej. To bezpieczna przestrzeń na swobodne omówienie trudności, które niepokoją rodziców lub dziecko. Podczas spotkania zbieram wywiad rozwojowy i rodzinny, wspólnie definiujemy cel współpracy oraz ustalamy proponowaną formę wsparcia (np. regularne spotkania z dzieckiem, konsultacje rodzicielskie czy ukierunkowane wskazówki wychowawcze).',
  },
  {
    id: 'obecnosc-dziecka',
    category: 'wizyta',
    question: 'Czy na pierwszej konsultacji musi być obecne dziecko?',
    shortAnswer:
      'Nie, w przypadku dzieci pierwsza konsultacja najczęściej odbywa się z samymi rodzicami lub opiekunami prawnymi.',
    fullAnswer:
      'Nie ma konieczności, aby dziecko uczestniczyło w pierwszym spotkaniu. W praktyce psychologicznej zaleca się, aby pierwsza wizyta odbyła się wyłącznie z rodzicami lub opiekunami. Pozwala to na otwartą, spokojną rozmowę o trudnościach, obawach i historii rozwoju dziecka bez obciążania go tematami dorosłymi. W przypadku starszej młodzieży (nastolatków) forma spotkania może być uzgodniona indywidualnie.',
  },
  {
    id: 'kiedy-do-psychologa',
    category: 'terapia',
    question: 'Kiedy warto zgłosić się z dzieckiem do psychologa?',
    shortAnswer:
      'Do psychologa warto zgłosić się, gdy zauważysz u dziecka nagłe zmiany w zachowaniu, nasilony lęk, trudności z regulacją emocji, problemy szkolne lub rówieśnicze.',
    fullAnswer:
      'Warto skorzystać z profesjonalnej pomocy, gdy u dziecka pojawiają się utrzymujące się stany lękowe, obniżony nastrój, wybuchy złości lub agresji, wycofanie z relacji z rówieśnikami, spadek motywacji do nauki, trudności ze snem czy objawy somatyczne (np. częste bóle brzucha przed szkołą bez przyczyn medycznych). Konsultacja jest również pomocna w sytuacjach kryzysu rodzinnego, takiego jak rozwód, przeprowadzka czy strata bliskiej osoby.',
  },
  {
    id: 'konsultacje-online',
    category: 'organizacyjne',
    question: 'Czy konsultacje psychologiczne online są skuteczne dla dzieci i młodzieży?',
    shortAnswer:
      'Tak, konsultacje psychologiczne online są w pełni skuteczną formą pomocy, szczególnie dla młodzieży, konsultacji rodzicielskich oraz osób spoza okolic Swarzędza i Poznania.',
    fullAnswer:
      'Konsultacje online przez bezpieczne wideopołączenie są sprawdzonym i skutecznym formatem wsparcia. Szczególnie dobrze sprawdzają się w pracy z nastolatkami, którzy czują się swobodnie w środowisku cyfrowym, a także w poradnictwie i psychoedukacji dla rodziców. To również idealne rozwiązanie, jeśli dojazd do gabinetu w Swarzędzu jest utrudniony ze względu na odległość lub obowiązki.',
  },
  {
    id: 'koszt-i-czas',
    category: 'organizacyjne',
    question: 'Ile trwa sesja i jaki jest koszt konsultacji psychologicznej?',
    shortAnswer:
      'Standardowa sesja trwa 50 minut. Koszt konsultacji stacjonarnej w gabinecie w Swarzędzu wynosi 220 zł, a konsultacji online – 200 zł.',
    fullAnswer:
      'Pojedyncza konsultacja psychologiczna trwa 50 minut. Cennik wynosi: 220 zł za sesję indywidualną stacjonarną (gabinet w Przychodni Multi-Medic, Swarzędz) oraz 200 zł za konsultację indywidualną online. Płatności można dokonać z góry podczas rezerwacji przez Przelewy24 (BLIK, szybki przelew) lub zgodnie z ustaleniami w gabinecie.',
  },
  {
    id: 'wiek-pacjentow',
    category: 'terapia',
    question: 'W jakim wieku dzieci i młodzież przyjmujesz w gabinecie?',
    shortAnswer:
      'Pracuję z dziećmi od 6. roku życia, młodzieżą w wieku szkolnym oraz prowadzę konsultacje i wsparcie wychowawcze dla rodziców.',
    fullAnswer:
      'Specjalizuję się w pomocy psychologicznej dzieciom w wieku wczesnoszkolnym i szkolnym (od 6. roku życia) oraz młodzieży i nastolatkom. Równolegle prowadzę konsultacje dla rodziców, wspierając ich w budowaniu relacji opartej na zrozumieniu potrzeb rozwojowych dziecka.',
  },
  {
    id: 'przygotowanie-dziecka',
    category: 'wizyta',
    question: 'Jak przygotować dziecko do pierwszej wizyty u psychologa?',
    shortAnswer:
      'Wytłumacz dziecku szczerze i spokojnie, że idzie na spotkanie z kimś, kto pomaga radzić sobie z trudnymi emocjami i kłopotami, unikając straszenia wizytą.',
    fullAnswer:
      'Warto przedstawić psychologa jako życzliwą osobę, z którą można porozmawiać, pobawić się lub poszukać sposobów na radzenie sobie ze smutkiem, złością czy stresem. Zapewnij dziecko, że w gabinecie nie ma oceniania, testów szkolnych ani zastrzyków. Nigdy nie należy używać wizyty u psychologa jako kary ani groźby.',
  },
  {
    id: 'tajemnica-zawodowa',
    category: 'terapia',
    question: 'Czy treści poruszane podczas sesji są poufne?',
    shortAnswer:
      'Tak, psychologa obowiązuje bezwzględna tajemnica zawodowa oraz zasady Kodeksu Etyczno-Zawodowego Psychologa.',
    fullAnswer:
      'Wszystkie informacje przekazywane podczas spotkań podlegają tajemnicy zawodowej. Wyjątkiem są wyłącznie sytuacje bezpośredniego zagrożenia życia lub zdrowia pacjenta bądź innych osób, co wynika bezpośrednio z przepisów prawa. W przypadku młodzieży dbam o wzajemne zaufanie, a istotne ustalenia przekazuję rodzicom w porozumieniu z młodym pacjentem.',
  },
];

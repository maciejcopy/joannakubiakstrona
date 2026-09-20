import React, { useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

export const PolitykaPrywatnosciPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      title="Polityka Prywatności Strony joannakubiakpsycholog.pl"
      subtitle="Informacje o zasadach przetwarzania oraz ochrony danych osobowych Użytkowników"
      lastUpdated="20.09.2026"
      icon="shield"
    >
      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

        {/* Sekcja 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            1. Postanowienia Ogólne
          </h2>
          <p>
            <strong>1.1.</strong> Niniejsza polityka prywatności ma charakter informacyjny i określa zasady przetwarzania oraz ochrony danych osobowych przekazanych przez Użytkowników w związku z korzystaniem przez nich z serwisu internetowego <span className="font-medium text-dark-green">www.joannakubiakpsycholog.pl</span> (dalej: „Serwis"), w tym w szczególności w związku z rezerwacją wizyt oraz dokonywaniem płatności online za usługi psychologiczne.
          </p>
          <p>
            <strong>1.2.</strong> Administratorem danych osobowych zawartych w Serwisie jest <strong>"Open Mind" Joanna Kubiak</strong>, z siedzibą w Gruszczyn ul. Moniuszki 39, NIP: 7792080715, REGON: 301134443, adres e-mail: <a href="mailto:joannakubiak102@gmail.com" className="text-dark-green font-semibold underline">joannakubiak102@gmail.com</a> (dalej: „Administrator").
          </p>
          <p>
            <strong>1.3.</strong> Administrator dba o bezpieczeństwo danych, m.in. poprzez stosowanie szyfrowanego połączenia (SSL/TLS) na całej stronie oraz w procesie płatności.
          </p>
          <p>
            <strong>1.4.</strong> Dane osobowe podawane w formularzu rezerwacji i płatności są traktowane jako poufne i nie są widoczne dla osób nieuprawnionych.
          </p>
        </section>

        {/* Sekcja 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            2. Administrator Danych
          </h2>
          <p>
            <strong>2.1.</strong> Administrator przetwarza dane osobowe zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
          </p>
          <p>
            <strong>2.2.</strong> Dane osobowe przetwarzane są na podstawie zgody Użytkownika, w celu wykonania umowy (świadczenie usługi/rezerwacja wizyty) oraz w przypadkach, w których przepisy prawa upoważniają Administratora do przetwarzania danych.
          </p>
          <p>
            <strong>2.3.</strong> Z uwagi na charakter świadczonych usług (usługi psychologiczne), sam fakt korzystania z Serwisu może stanowić informację o stanie zdrowia w rozumieniu art. 9 RODO (dane szczególnej kategorii). Administrator przetwarza takie dane wyłącznie na podstawie wyraźnej zgody Użytkownika (art. 9 ust. 2 lit. a RODO), wyrażonej poprzez dokonanie rezerwacji, oraz z zachowaniem szczególnej staranności.
          </p>
        </section>

        {/* Sekcja 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            3. Cele i zakres zbierania danych
          </h2>
          <p><strong>3.1.</strong> Administrator przetwarza dane osobowe w celu:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li><strong>a)</strong> umożliwienia rezerwacji terminu wizyty poprzez widget rezerwacyjny (Cal.com) — wykonanie umowy (art. 6 ust. 1 lit. b RODO);</li>
            <li><strong>b)</strong> realizacji i rozliczenia płatności online za wizytę za pośrednictwem operatora płatności Przelewy24 — wykonanie umowy (art. 6 ust. 1 lit. b RODO);</li>
            <li><strong>c)</strong> prowadzenia konta Użytkownika (panel pacjenta) umożliwiającego wgląd w historię rezerwacji — wykonanie umowy (art. 6 ust. 1 lit. b RODO);</li>
            <li><strong>d)</strong> obsługi zgłoszeń przesyłanych przez formularz kontaktowy — prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO);</li>
            <li><strong>e)</strong> wystawienia dokumentów księgowych związanych z płatnością — obowiązek prawny (art. 6 ust. 1 lit. c RODO);</li>
            <li><strong>f)</strong> ustalenia, dochodzenia lub obrony przed roszczeniami — prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO);</li>
            <li><strong>g)</strong> przesyłania wiadomości e-mail niezbędnych do funkcjonowania konta i rezerwacji, w tym potwierdzenia adresu e-mail przy zakładaniu konta, potwierdzenia dokonania rezerwacji oraz przypomnienia o zbliżającym się terminie wizyty — wykonanie umowy (art. 6 ust. 1 lit. b RODO).</li>
          </ul>
          <p>
            <strong>3.2. Zakres przetwarzanych danych:</strong> imię i nazwisko, adres e-mail, numer telefonu, wybrany termin i rodzaj wizyty, status rezerwacji oraz status płatności, a przy zakładaniu konta w panelu Użytkownika dodatkowo (w części opcjonalnie): kraj, adres (ulica, numer domu/mieszkania), kod pocztowy, miasto, województwo/powiat.{' '}
            <strong className="text-dark-green">Administrator nie zbiera i nie przechowuje w Serwisie treści dotyczących przebiegu terapii, notatek klinicznych ani diagnoz</strong> — Serwis obsługuje wyłącznie proces rezerwacji i płatności.
          </p>
        </section>

        {/* Sekcja 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            4. Powierzenie przetwarzania danych i podmioty przetwarzające
          </h2>
          <p>
            <strong>4.1.</strong> W celu prawidłowego działania Serwisu Administrator korzysta z usług następujących podmiotów przetwarzających dane osobowe na podstawie zawartych z nimi umów powierzenia przetwarzania danych (art. 28 RODO):
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase Inc.</strong> — hosting bazy danych i backendu Serwisu;</li>
            <li><strong>Cal.com</strong> — obsługa widgetu i procesu rezerwacji terminów;</li>
            <li><strong>Google LLC</strong> — synchronizacja kalendarza wizyt oraz obsługa spotkań online (Google Calendar / Google Meet), a także — w zakresie automatyzacji obsługi rezerwacji napływających z zewnętrznego serwisu ZnanyLekarz — odczyt wiadomości e-mail (Gmail) oraz automatyczne przetwarzanie ich treści przy użyciu modelu Gemini w celu utworzenia odpowiedniego wpisu rezerwacji;</li>
            <li><strong>PayPro S.A. (Przelewy24)</strong> — obsługa płatności online za wizyty;</li>
            <li><strong>Netlify, Inc.</strong> — hosting strony internetowej;</li>
            <li><strong>Resend</strong> — dostawca usługi poczty transakcyjnej, za pośrednictwem którego wysyłane są wiadomości e-mail dotyczące konta i rezerwacji (potwierdzenie adresu e-mail, potwierdzenie rezerwacji, przypomnienie o wizycie);</li>
            <li><strong>Make.com</strong> — platforma automatyzacji wykorzystywana do przetwarzania i synchronizacji danych rezerwacji napływających z serwisu ZnanyLekarz pomiędzy pocztą e-mail, bazą danych Serwisu a kalendarzem.</li>
          </ul>
          <p>
            <strong>4.2.</strong> Część z wymienionych dostawców może przetwarzać dane poza Europejskim Obszarem Gospodarczym (EOG). W takim przypadku Administrator zapewnia odpowiedni poziom ochrony danych zgodnie ze standardowymi klauzulami umownymi zatwierdzonymi przez Komisję Europejską lub innymi mechanizmami przewidzianymi w RODO.
          </p>
        </section>

        {/* Sekcja 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            5. Prawa osób, których dane dotyczą
          </h2>
          <p>
            <strong>5.1.</strong> Użytkownik ma prawo dostępu do treści swoich danych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych, prawo wniesienia sprzeciwu, a także prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem.
          </p>
          <p>
            <strong>5.2.</strong> W celu realizacji powyższych uprawnień należy kontaktować się z Administratorem pod adresem e-mail: <a href="mailto:maciejkubiakcopy@gmail.com" className="text-dark-green font-semibold underline">maciejkubiakcopy@gmail.com</a>.
          </p>
          <p>
            <strong>5.3.</strong> Użytkownik ma prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), jeśli uzna, że przetwarzanie jego danych narusza przepisy RODO.
          </p>
        </section>

        {/* Sekcja 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            6. Pliki Cookies
          </h2>
          <p>
            <strong>6.1.</strong> Serwis wykorzystuje pliki cookies wyłącznie w celach niezbędnych do jego prawidłowego działania: utrzymania sesji Użytkownika (np. logowania do panelu pacjenta), zapewnienia prawidłowego działania widgetu rezerwacyjnego oraz procesu płatności. Serwis nie korzysta obecnie z narzędzi analitycznych (np. Google Analytics) ani marketingowych (np. piksela Meta).
          </p>
          <p>
            <strong>6.2.</strong> W ramach Serwisu stosowane są pliki cookies „sesyjne" oraz „stałe".
          </p>
          <p>
            <strong>6.3.</strong> Użytkownik może w każdej chwili zarządzać ustawieniami cookies w swojej przeglądarce internetowej.
          </p>
        </section>

        {/* Sekcja 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            7. Okres przechowywania danych
          </h2>
          <div className="overflow-x-auto my-4 border border-gray-200 rounded-2xl shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-green-bg/50 border-b border-gray-200 text-dark-green font-serif font-bold text-xs uppercase tracking-wider">
                  <th className="p-3.5">Rodzaj danych</th>
                  <th className="p-3.5">Okres przechowywania</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-medium text-gray-900">Dane rezerwacji (imię, e-mail, telefon, termin wizyty)</td>
                  <td className="p-3.5">Przez okres świadczenia usług oraz do momentu przedawnienia ewentualnych roszczeń (standardowo do 6 lat)</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-medium text-gray-900">Dane związane z płatnością i dokumenty księgowe</td>
                  <td className="p-3.5">5 lat od końca roku podatkowego, w którym dokonano płatności (przepisy podatkowe)</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-medium text-gray-900">Konto w panelu pacjenta</td>
                  <td className="p-3.5">Do czasu usunięcia konta przez Użytkownika lub na jego żądanie</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-medium text-gray-900">Zgłoszenia z formularza kontaktowego</td>
                  <td className="p-3.5">Do 12 miesięcy od ostatniego kontaktu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sekcja 8 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            8. Postanowienia Końcowe
          </h2>
          <p>
            <strong>8.1.</strong> Administrator stosuje środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych odpowiednią do zagrożeń oraz kategorii danych objętych ochroną.
          </p>
          <p>
            <strong>8.2.</strong> W sprawach nieuregulowanych niniejszą Polityką stosuje się przepisy RODO oraz właściwe przepisy prawa polskiego.
          </p>
          <p>
            <strong>8.3.</strong> Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce. Zmiany wchodzą w życie z chwilą ich publikacji w Serwisie.
          </p>
          <p className="pt-2 text-xs text-gray-500 font-medium">
            Data ostatniej aktualizacji: 20.09.2026.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};

export default PolitykaPrywatnosciPage;


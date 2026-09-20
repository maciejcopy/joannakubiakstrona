import React, { useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import { Link } from 'react-router-dom';

export const RegulaminPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      title="Regulamin Świadczenia Usług Serwisu joannakubiakpsycholog.pl"
      subtitle="Zasady świadczenia usług psychologicznych drogą elektroniczną oraz stacjonarnie"
      lastUpdated="20.09.2026"
      icon="file"
    >
      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

        {/* Sekcja 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            1. Postanowienia Ogólne
          </h2>
          <p>
            <strong>1.1.</strong> Niniejszy Regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem <span className="font-medium text-dark-green">www.joannakubiakpsycholog.pl</span> (dalej: „Serwis"), w tym zasady świadczenia usług drogą elektroniczną (prowadzenie konta w Panelu Pacjenta, obsługa procesu Rezerwacji), zasady rezerwacji wizyt psychologicznych oraz zasady dokonywania płatności online za te usługi.
          </p>
          <p>
            <strong>1.2.</strong> Usługodawcą jest <strong>"Open Mind" Joanna Kubiak</strong>, z siedzibą w Gruszczyn ul. Moniuszki 39, NIP: 7792080715, REGON: 301134443, adres e-mail: <a href="mailto:joannakubiak102@gmail.com" className="text-dark-green font-semibold underline">joannakubiak102@gmail.com</a>, numer telefonu: +48 602 105 795 (dalej: „Usługodawca").
          </p>
          <p>
            <strong>1.3.</strong> Regulamin jest udostępniony nieodpłatnie na stronie Serwisu w sposób umożliwiający jego pozyskanie, odtwarzanie, utrwalanie i wydrukowanie, zgodnie z art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.
          </p>
          <p>
            <strong>1.4.</strong> Korzystanie z Serwisu, w tym dokonanie Rezerwacji, oznacza akceptację niniejszego Regulaminu.
          </p>
        </section>

        {/* Sekcja 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            2. Definicje
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Serwis</strong> — strona internetowa www.joannakubiakpsycholog.pl.</li>
            <li><strong>Użytkownik</strong> — osoba fizyczna korzystająca z Serwisu, w tym dokonująca Rezerwacji.</li>
            <li><strong>Konsument</strong> — Użytkownik będący osobą fizyczną dokonującą Rezerwacji niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.</li>
            <li><strong>Usługa</strong> — usługa konsultacji psychologicznej świadczona przez Usługodawcę, dostępna w dwóch wariantach: online oraz stacjonarnie.</li>
            <li><strong>Usługa elektroniczna</strong> — usługa świadczona przez Usługodawcę na rzecz Użytkownika za pośrednictwem Serwisu, w szczególności: udostępnienie widgetu rezerwacyjnego, prowadzenie Panelu Pacjenta, obsługa formularza kontaktowego.</li>
            <li><strong>Rezerwacja</strong> — dokonane przez Użytkownika zamówienie terminu Usługi za pośrednictwem widgetu rezerwacyjnego dostępnego w Serwisie.</li>
            <li><strong>Panel Pacjenta</strong> — konto Użytkownika w Serwisie umożliwiające wgląd w historię Rezerwacji oraz zarządzanie nimi.</li>
          </ul>
        </section>

        {/* Sekcja 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            3. Usługi Świadczone Drogą Elektroniczną i Wymagania Techniczne
          </h2>
          <p>
            <strong>3.1.</strong> Usługodawca świadczy za pośrednictwem Serwisu następujące Usługi elektroniczne: udostępnienie formularza Rezerwacji, prowadzenie Panelu Pacjenta oraz obsługę formularza kontaktowego. Usługi elektroniczne świadczone są nieodpłatnie — odpłatności podlega wyłącznie Usługa opisana w §4.
          </p>
          <p>
            <strong>3.2.</strong> Do prawidłowego korzystania z Serwisu niezbędne są: urządzenie z dostępem do sieci Internet, aktualna przeglądarka internetowa obsługująca JavaScript i pliki cookies, oraz aktywny adres e-mail. Do korzystania z konsultacji online dodatkowo niezbędne jest urządzenie wyposażone w mikrofon i kamerę oraz łącze internetowe o przepustowości wystarczającej do prowadzenia wideorozmowy.
          </p>
          <p>
            <strong>3.3.</strong> Zabronione jest dostarczanie przez Użytkownika treści o charakterze bezprawnym oraz korzystanie z Serwisu w sposób zakłócający jego funkcjonowanie lub naruszający prawa Usługodawcy bądź osób trzecich.
          </p>
          <p>
            <strong>3.4.</strong> Umowa o świadczenie Usługi elektronicznej polegającej na prowadzeniu Panelu Pacjenta zawierana jest z chwilą skutecznej rejestracji konta (potwierdzenia adresu e-mail) i zawierana jest na czas nieokreślony. Użytkownik może w każdym czasie zażądać usunięcia konta, przesyłając taką prośbę na adres e-mail wskazany w §1.2. Konto może założyć wyłącznie osoba pełnoletnia.
          </p>
        </section>

        {/* Sekcja 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            4. Zakres i Opis Usługi Głównej
          </h2>
          <p><strong>4.1.</strong> Za pośrednictwem Serwisu można zarezerwować następujące Usługi:</p>
          <div className="overflow-x-auto my-4 border border-gray-200 rounded-2xl shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-green-bg/50 border-b border-gray-200 text-dark-green font-serif font-bold text-xs uppercase tracking-wider">
                  <th className="p-3.5">Usługa</th>
                  <th className="p-3.5">Forma</th>
                  <th className="p-3.5">Czas trwania</th>
                  <th className="p-3.5">Cena</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-medium text-gray-900">Konsultacja indywidualna – online</td>
                  <td className="p-3.5">Wideorozmowa (link do spotkania przesyłany po Rezerwacji)</td>
                  <td className="p-3.5">50 minut</td>
                  <td className="p-3.5 font-bold text-dark-green">200 zł</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-medium text-gray-900">Konsultacja indywidualna – stacjonarnie</td>
                  <td className="p-3.5">Osobiście, pod adresem: ul. Moniuszki 39, 62-006 Gruszczyn</td>
                  <td className="p-3.5">50 minut</td>
                  <td className="p-3.5 font-bold text-dark-green">220 zł</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>4.2.</strong> Dopuszcza się dokonanie Rezerwacji przez rodzica/opiekuna prawnego na rzecz dziecka — w takim przypadku obecność rodzica/opiekuna prawnego jest wymagana przy pierwszej konsultacji dziecka. Podczas Rezerwacji Użytkownik wskazuje, czy Usługa dotyczy jego samego, czy dziecka.
          </p>
          <p>
            <strong>4.3.</strong> Usługodawca nie gwarantuje osiągnięcia określonego rezultatu terapeutycznego. Usługa polega na przeprowadzeniu konsultacji psychologicznej z zachowaniem należytej staranności zawodowej.
          </p>
        </section>

        {/* Sekcja 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            5. Zawarcie Umowy i Sposób Rezerwacji
          </h2>
          <p>
            <strong>5.1.</strong> Rezerwacji dokonuje się za pośrednictwem widgetu rezerwacyjnego dostępnego w Serwisie, wybierając rodzaj Usługi oraz dogodny termin z dostępnych opcji.
          </p>
          <p>
            <strong>5.2.</strong> Warunkiem dokonania Rezerwacji jest podanie wymaganych danych (imię i nazwisko, adres e-mail, numer telefonu) oraz zaakceptowanie niniejszego Regulaminu poprzez zaznaczenie odpowiedniego pola w formularzu Rezerwacji.
          </p>
          <p>
            <strong>5.3.</strong> Umowę o świadczenie Usługi uznaje się za zawartą z chwilą potwierdzenia Rezerwacji oraz zaksięgowania płatności, o której mowa w §6.
          </p>
        </section>

        {/* Sekcja 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            6. Płatności
          </h2>
          <p>
            <strong>6.1.</strong> Warunkiem potwierdzenia Rezerwacji jest dokonanie płatności z góry, za pośrednictwem operatora płatności Przelewy24 (PayPro S.A.). Serwis nie umożliwia opłacenia Usługi na miejscu ani w innej formie.
          </p>
          <p>
            <strong>6.2.</strong> Ceny Usług podane są w złotych polskich i są cenami brutto.
          </p>
          <p>
            <strong>6.3.</strong> W przypadku problemów z płatnością Rezerwacja nie zostaje potwierdzona, a termin pozostaje dostępny dla innych Użytkowników.
          </p>
        </section>

        {/* Sekcja 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            7. Odwołanie i Przełożenie Wizyty, Zwroty Płatności
          </h2>
          <p>
            <strong>7.1.</strong> Użytkownik może samodzielnie odwołać lub przełożyć zarezerwowaną wizytę za pośrednictwem Panelu Pacjenta, pod warunkiem że do terminu wizyty pozostało co najmniej 24 godziny.
          </p>
          <p>
            <strong>7.2.</strong> Jeżeli do terminu wizyty pozostało mniej niż 24 godziny, samodzielne odwołanie lub przełożenie wizyty w Panelu Pacjenta nie jest możliwe. W takiej sytuacji Użytkownik powinien skontaktować się telefonicznie lub mailowo z Usługodawcą (dane kontaktowe wskazane w §1.2), który może dokonać odwołania lub przełożenia wizyty ręcznie.
          </p>
          <p>
            <strong>7.3.</strong> W przypadku odwołania wizyty (niezależnie od tego, czy nastąpiło to samodzielnie w Panelu Pacjenta, czy w drodze kontaktu z Usługodawcą zgodnie z §7.2) Użytkownikowi przysługuje pełny zwrot dokonanej płatności.
          </p>
          <p>
            <strong>7.4.</strong> Zwrot płatności realizowany jest ręcznie przez Usługodawcę na rachunek, z którego dokonano płatności, w terminie do 14 dni roboczych od dnia odwołania wizyty.
          </p>
          <p>
            <strong>7.5.</strong> W przypadku niestawienia się Użytkownika na potwierdzoną i opłaconą wizytę, bez uprzedniego jej odwołania (tzw. „no-show"), płatność nie podlega zwrotowi.
          </p>
          <p>
            <strong>7.6.</strong> Przełożenie wizyty na inny termin (dokonane zgodnie z §7.1 lub §7.2) nie wymaga dodatkowej płatności — dokonana wcześniej płatność pozostaje przypisana do nowego terminu.
          </p>
        </section>

        {/* Sekcja 8 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            8. Prawo Odstąpienia od Umowy
          </h2>
          <p>
            <strong>8.1.</strong> Konsumentowi przysługuje prawo odstąpienia od umowy zawartej na odległość w terminie 14 dni od dnia jej zawarcia, bez podawania przyczyny, zgodnie z ustawą z dnia 30 maja 2014 r. o prawach konsumenta.
          </p>
          <p>
            <strong>8.2.</strong> Skorzystanie z prawa odstąpienia następuje poprzez złożenie jednoznacznego oświadczenia (np. pismo wysłane pocztą lub pocztą elektroniczną na adres wskazany w §1.2). Użytkownik może skorzystać ze wzoru oświadczenia stanowiącego Załącznik nr 1 do niniejszego Regulaminu, jednak nie jest to obowiązkowe.
          </p>
          <p>
            <strong>8.3.</strong> Z uwagi na to, że zgodnie z §7.3 Usługodawca zapewnia pełny zwrot płatności w każdym przypadku odwołania wizyty (niezależnie od terminu, w jakim to nastąpiło), uprawnienie opisane w niniejszym paragrafie ma w praktyce zastosowanie przede wszystkim do sytuacji, w której Użytkownik chciałby zrezygnować z Usługi z innego powodu niż odwołanie konkretnej wizyty.
          </p>
          <p>
            <strong>8.4.</strong> Prawo odstąpienia nie przysługuje w zakresie, w jakim usługa została w pełni wykonana za wyraźną i uprzednią zgodą Konsumenta, który został poinformowany przed rozpoczęciem świadczenia, że po jego spełnieniu utraci prawo odstąpienia od umowy.
          </p>
        </section>

        {/* Sekcja 9 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            9. Reklamacje
          </h2>
          <p>
            <strong>9.1.</strong> Reklamacje dotyczące funkcjonowania Serwisu oraz Usług elektronicznych, w tym w szczególności: błędów w procesie Rezerwacji, nieprawidłowości w rozliczeniu płatności, problemów technicznych z dostępem do spotkania online (link do wideorozmowy) lub pomyłek w zakresie zarezerwowanego terminu, można zgłaszać na adres e-mail wskazany w §1.2.
          </p>
          <p>
            <strong>9.2.</strong> Reklamacja powinna zawierać: imię i nazwisko Użytkownika, opis zgłaszanego problemu oraz oczekiwany sposób jego rozwiązania.
          </p>
          <p>
            <strong>9.3.</strong> Usługodawca rozpatruje reklamację w terminie 14 dni od dnia jej otrzymania i informuje Użytkownika o wyniku jej rozpatrzenia na adres e-mail, z którego reklamacja została wysłana.
          </p>
          <p>
            <strong>9.4.</strong> Niniejszy tryb reklamacyjny nie obejmuje oceny merytorycznej jakości przeprowadzonej konsultacji psychologicznej.
          </p>
          <p>
            <strong>9.5.</strong> Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w tym zwrócenia się o pomoc do właściwego ze względu na miejsce zamieszkania Powiatowego (Miejskiego) Rzecznika Konsumentów lub Wojewódzkiego Inspektora Inspekcji Handlowej. Wykaz podmiotów uprawnionych do pozasądowego rozwiązywania sporów konsumenckich dostępny jest na stronie internetowej Urzędu Ochrony Konkurencji i Konsumentów (<a href="https://uokik.gov.pl" target="_blank" rel="noopener noreferrer" className="text-dark-green underline font-semibold">uokik.gov.pl</a>).
          </p>
        </section>

        {/* Sekcja 10 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            10. Dane Osobowe
          </h2>
          <p>
            <strong>10.1.</strong> Zasady przetwarzania danych osobowych Użytkowników określa Polityka Prywatności dostępna pod adresem:{' '}
            <Link to="/polityka-prywatnosci" className="text-dark-green font-semibold underline hover:text-pastel-blue transition-colors">
              /polityka-prywatnosci
            </Link>.
          </p>
        </section>

        {/* Sekcja 11 */}
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-dark-green border-b border-light-green/30 pb-2">
            11. Postanowienia Końcowe
          </h2>
          <p>
            <strong>11.1.</strong> Usługodawca zastrzega sobie prawo do wprowadzania zmian w niniejszym Regulaminie z ważnych przyczyn (w szczególności: zmiana zakresu Usług, zmiana przepisów prawa, zmiana danych Usługodawcy). Zmiany wchodzą w życie z chwilą ich publikacji w Serwisie i nie mają wpływu na Rezerwacje dokonane przed ich wprowadzeniem.
          </p>
          <p>
            <strong>11.2.</strong> W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w tym Kodeksu cywilnego, ustawy o prawach konsumenta oraz ustawy o świadczeniu usług drogą elektroniczną.
          </p>
          <p className="pt-2 text-xs text-gray-500 font-medium">
            Data wejścia w życie Regulaminu: 20.09.2026
          </p>
        </section>

        {/* Załącznik 1 */}
        <section className="mt-10 p-6 bg-light-green-bg/30 border border-light-green/40 rounded-2xl space-y-3">
          <h3 className="text-base font-serif font-bold text-dark-green">
            Załącznik nr 1 — Wzór formularza odstąpienia od umowy
          </h3>
          <p className="text-xs text-gray-500 italic">
            (formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)
          </p>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-2 font-mono text-gray-800">
            <p><strong>Adresat:</strong> "Open Mind" Joanna Kubiak, Gruszczyn ul. Moniuszki 39, joannakubiak102@gmail.com</p>
            <p className="pt-2">Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym odstąpieniu od umowy o świadczenie następującej usługi:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Rodzaj usługi: ....................................................</li>
              <li>Data zawarcia umowy (Rezerwacji): ....................................................</li>
              <li>Imię i nazwisko Konsumenta: ....................................................</li>
              <li>Adres Konsumenta: ....................................................</li>
              <li>Podpis Konsumenta (tylko jeżeli formularz jest przesyłany w wersji papierowej): ....................................................</li>
              <li>Data: ....................................................</li>
            </ul>
            <p className="text-gray-400 italic text-[11px] pt-1">(*) niepotrzebne skreślić</p>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};

export default RegulaminPage;


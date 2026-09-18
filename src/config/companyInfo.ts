export interface CompanyInfo {
  companyName: string;
  ownerName: string;
  nip: string;
  regon: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  email: string;
  phone: string;
}

/**
 * Centralny obiekt przechowujący dane rejestrowe i kontaktowe firmy.
 * Zmiana w tym miejscu automatycznie zaktualizuje stopkę, stronę kontaktu oraz nagłówki dokumentów prawnych.
 */
export const COMPANY_INFO: CompanyInfo = {
  companyName: "[TUTAJ_NAZWA_FIRMY]",
  ownerName: "mgr Joanna Kubiak",
  nip: "[TUTAJ_NIP]",
  regon: "[TUTAJ_REGON]",
  address: {
    street: "[TUTAJ_ULICA]",
    postalCode: "[TUTAJ_KOD]",
    city: "[TUTAJ_MIASTO]",
  },
  email: "kontakt@joannakubiakpsycholog.pl",
  phone: "+48 729 933 833",
};

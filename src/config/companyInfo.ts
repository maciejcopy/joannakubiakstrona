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
  companyName: '"Open Mind" Joanna Kubiak',
  ownerName: "mgr Joanna Kubiak",
  nip: "7792080715",
  regon: "301134443",
  address: {
    street: "ul. Moniuszki 39",
    postalCode: "62-006",
    city: "Gruszczyn",
  },
  email: "joannakubiakpsycholog@gmail.com",
  phone: "+48 602 105 795",
};

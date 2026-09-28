import { COMPANY_INFO } from './companyInfo';
import { FAQ_DATA } from './faqData';

const DEFAULT_BASE_URL = 'https://www.joannakubiakpsycholog.pl';

const getBaseUrl = (overrideUrl?: string): string => {
  if (overrideUrl) return overrideUrl;
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return DEFAULT_BASE_URL;
};

/**
 * Główny schemat Schema.org dla Strony Głównej:
 * - MedicalBusiness / Psychologist
 * - Person (mgr Joanna Kubiak)
 * - FAQPage (Baza pytań AEO)
 */
export const getPsychologistMainSchema = (baseUrlOverride?: string) => {
  const baseUrl = getBaseUrl(baseUrlOverride);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['MedicalBusiness', 'LocalBusiness', 'HealthAndBeautyBusiness'],
        '@id': `${baseUrl}/#medical-business`,
        name: `${COMPANY_INFO.ownerName} – Psycholog dzieci i młodzieży`,
        legalName: COMPANY_INFO.companyName,
        url: baseUrl,
        logo: `${baseUrl}/images/about-image.webp`,
        image: `${baseUrl}/images/about-image.webp`,
        telephone: COMPANY_INFO.phone,
        email: COMPANY_INFO.email,
        taxID: COMPANY_INFO.nip,
        priceRange: '200 zł - 220 zł',
        description:
          'Profesjonalna pomoc psychologiczna dla dzieci (od 6 lat), młodzieży i rodziców. Gabinet stacjonarny w Swarzędzu (Przychodnia Lekarska Multi-Medic) oraz konsultacje online.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ul. Cieszkowskiego 100/102',
          addressLocality: 'Swarzędz',
          postalCode: '62-020',
          addressRegion: 'Wielkopolskie',
          addressCountry: 'PL',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '52.4172',
          longitude: '17.0697',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '20:00',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Usługi psychologiczne',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Konsultacja indywidualna – stacjonarnie',
              description: '50-minutowa sesja stacjonarna w gabinecie w Swarzędzu (Przychodnia Multi-Medic).',
              price: '220',
              priceCurrency: 'PLN',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/rezerwacja`,
            },
            {
              '@type': 'Offer',
              name: 'Konsultacja indywidualna – online',
              description: '50-minutowa sesja psychologiczna online przez bezpieczne połączenie wideo.',
              price: '200',
              priceCurrency: 'PLN',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/rezerwacja`,
            },
          ],
        },
      },
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#person`,
        name: COMPANY_INFO.ownerName,
        jobTitle: 'Psycholog dzieci i młodzieży',
        worksFor: {
          '@id': `${baseUrl}/#medical-business`,
        },
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: 'Uczelnia Biznesu i Nauk Stosowanych „Varsovia” w Warszawie',
        },
        description:
          'Psycholog dziecięcy i młodzieży, magister psychologii ze specjalizacją w psychoterapii. Doświadczenie w placówkach oświatowych i prywatnych, techniki DBT, wsparcie w kryzysie.',
        knowsAbout: [
          'Psychologia dziecięca',
          'Psychologia młodzieży',
          'Terapia dialektyczno-behawioralna (DBT)',
          'ADHD i zaburzenia koncentracji',
          'Zaburzenia lękowe i stany depresyjne',
          'Wsparcie rodzicielskie i trudności wychowawcze',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq`,
        mainEntity: FAQ_DATA.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.fullAnswer,
          },
        })),
      },
    ],
  };
};

/**
 * Schemat dla podstrony Kontakt (/kontakt)
 */
export const getContactPageSchema = (baseUrlOverride?: string) => {
  const baseUrl = getBaseUrl(baseUrlOverride);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${baseUrl}/kontakt#webpage`,
        url: `${baseUrl}/kontakt`,
        name: `Kontakt i Gabinety – ${COMPANY_INFO.ownerName}`,
        description:
          'Skontaktuj się z mgr Joanną Kubiak. Gabinet stacjonarny w Przychodni Lekarskiej Multi-Medic w Swarzędzu oraz konsultacje online.',
        mainEntity: {
          '@type': 'LocalBusiness',
          name: `${COMPANY_INFO.ownerName} - Gabinet Psychologiczny`,
          telephone: COMPANY_INFO.phone,
          email: COMPANY_INFO.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'ul. Cieszkowskiego 100/102',
            addressLocality: 'Swarzędz',
            postalCode: '62-020',
            addressCountry: 'PL',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/kontakt#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Strona główna',
            item: `${baseUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Kontakt',
            item: `${baseUrl}/kontakt`,
          },
        ],
      },
    ],
  };
};

/**
 * Uniwersalny schemat BreadcrumbList
 */
export const getBreadcrumbSchema = (
  items: { name: string; path: string }[],
  baseUrlOverride?: string
) => {
  const baseUrl = getBaseUrl(baseUrlOverride);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
};

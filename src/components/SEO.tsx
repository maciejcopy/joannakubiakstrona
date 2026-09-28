import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'mgr Joanna Kubiak – Psycholog dzieci i młodzieży | Swarzędz & Online';
const DEFAULT_DESCRIPTION =
  'mgr Joanna Kubiak – psycholog dziecięcy i młodzieży. Profesjonalna pomoc psychologiczna dla dzieci, nastolatków i rodziców. Gabinet stacjonarny w Swarzędzu oraz konsultacje online.';
const DEFAULT_KEYWORDS =
  'psycholog dziecięcy Swarzędz, psycholog młodzieży Poznań, pomoc psychologiczna, terapia dzieci i młodzieży, konsultacja psychologiczna online, Joanna Kubiak psycholog';
const DEFAULT_OG_IMAGE = '/images/about-image.webp';
const SITE_NAME = 'mgr Joanna Kubiak - Gabinet Psychologiczny';

/**
 * Komponent do dynamicznego zarządzania metadanymi strony w architekturze SPA (React)
 * Obsługuje tagi SEO, Open Graph, Twitter Cards, link kanoniczny oraz dane strukturalne JSON-LD.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Tytuł strony
    const effectiveTitle = title
      ? (title.includes('mgr Joanna Kubiak') ? title : `${title} | mgr Joanna Kubiak`)
      : DEFAULT_TITLE;
    document.title = effectiveTitle;

    // Helper do ustawiania lub tworzenia tagu meta
    const setMetaTag = (attributeName: 'name' | 'property', attributeValue: string, content: string | undefined) => {
      if (content === undefined) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Podstawowe meta tagi
    const effectiveDescription = description || DEFAULT_DESCRIPTION;
    const effectiveKeywords = keywords || DEFAULT_KEYWORDS;
    setMetaTag('name', 'description', effectiveDescription);
    setMetaTag('name', 'keywords', effectiveKeywords);

    // 3. Link kanoniczny
    const currentUrl = canonical || window.location.href.split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 4. Open Graph
    const effectiveOgTitle = ogTitle || effectiveTitle;
    const effectiveOgDescription = ogDescription || effectiveDescription;
    const effectiveOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`) : `${window.location.origin}${DEFAULT_OG_IMAGE}`;

    setMetaTag('property', 'og:title', effectiveOgTitle);
    setMetaTag('property', 'og:description', effectiveOgDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', effectiveOgImage);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:locale', 'pl_PL');

    // 5. Twitter Card
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', effectiveOgTitle);
    setMetaTag('name', 'twitter:description', effectiveOgDescription);
    setMetaTag('name', 'twitter:image', effectiveOgImage);

    // 6. JSON-LD Structured Data
    const JSON_LD_SCRIPT_ID = 'dynamic-json-ld';
    let scriptElement = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = JSON_LD_SCRIPT_ID;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd, null, 2);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    // Cleanup przy odmontowaniu komponentu
    return () => {
      const scriptToRemove = document.getElementById(JSON_LD_SCRIPT_ID);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    jsonLd,
  ]);

  return null;
};

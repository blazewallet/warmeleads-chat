'use client';

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.warmeleads.eu/#organization",
        "name": "WarmeLeads",
        "alternateName": "WarmeLeads Nederland",
        "description": "Leadgeneratie specialist voor thuisbatterijen, zonnepanelen, warmtepompen, airco's en financial lease in Nederland",
        "url": "https://www.warmeleads.eu",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.warmeleads.eu/logo.png",
          "width": 400,
          "height": 400
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+31-85-047-7067",
          "contactType": "customer service",
          "email": "info@warmeleads.eu",
          "availableLanguage": "Dutch"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "NL",
          "addressLocality": "Nederland"
        },
        "sameAs": [
          "https://www.warmeleads.eu"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.warmeleads.eu/#website",
        "url": "https://www.warmeleads.eu",
        "name": "WarmeLeads - Leadgeneratie Nederland",
        "description": "Koop verse leads voor thuisbatterijen, zonnepanelen, warmtepompen, airco's en financial lease",
        "publisher": {
          "@id": "https://www.warmeleads.eu/#organization"
        },
        "inLanguage": "nl-NL"
      },
      {
        "@type": "Service",
        "@id": "https://www.warmeleads.eu/#service",
        "name": "Leadgeneratie Service",
        "description": "Verse leads voor thuisbatterijen, zonnepanelen, warmtepompen, airco's en financial lease. Exclusieve en gedeelde leads uit onze campagnes.",
        "provider": {
          "@id": "https://www.warmeleads.eu/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Nederland"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Lead Packages",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Exclusieve Leads Thuisbatterijen",
                "description": "Exclusieve leads voor thuisbatterijen, alleen voor uw bedrijf"
              },
              "priceRange": "€37.50-€42.50",
              "priceCurrency": "EUR"
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Gedeelde Leads Thuisbatterijen",
                "description": "Gedeelde leads voor thuisbatterijen, kosteneffectief"
              },
              "priceRange": "€12.50",
              "priceCurrency": "EUR"
            }
          ]
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}







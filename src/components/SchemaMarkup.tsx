"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SITE_URL = "https://www.katyaayaniastrologer.com";
// Square logo - used for Bing/Google Knowledge Panel logo (must be publicly accessible, no transforms)
const LOGO_URL = "https://eochjxjoyibtjawzgauk.supabase.co/storage/v1/object/public/blog-images/og/og-home-1771646111561.png";
const OG_IMAGE = "https://eochjxjoyibtjawzgauk.supabase.co/storage/v1/object/public/blog-images/og/og-home-1771646111561.png";
const SEARCH_THUMBNAIL = LOGO_URL;

const ORG_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Katyaayani Astrologer",
  alternateName: ["Katyaayani Jyotish", "Katyayani Ancient Astrology", "KVA"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    url: LOGO_URL,
    contentUrl: LOGO_URL,
    width: 1200,
    height: 630,
    caption: "Katyaayani Astrologer",
  },
  image: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 1200,
    height: 630,
  },
  description: "Step into the timeless legacy of Katyayani Ancient Astrology 'KVA', where centuries-old Brahmin traditions meet 21st-century wisdom.",
  foundingDate: "2007",
  founder: {
    "@type": "Person",
    "@id": `${SITE_URL}/#founder`,
    name: "Rudram Joshi",
    image: LOGO_URL,
    jobTitle: "Founder & Chief Ancient Astrologer",
    worksFor: { "@id": `${SITE_URL}/#organization` },
  },
  areaServed: { "@type": "Country", name: "India" },
  serviceType: ["Ancient Astrology", "Kundali Analysis", "Horoscope Reading", "Vastu Shastra", "Marriage Matching"],
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "katyaayaniastrologer01@gmail.com",
    availableLanguage: ["English", "Hindi", "Gujarati"],
  },
};

const SCHEMA_DEFAULTS: Record<string, Record<string, unknown>> = {
  "/": {
    "@context": "https://schema.org",
    "@graph": [
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: "Katyaayani Astrologer",
          alternateName: ["Katyaayani Jyotish", "Katyayani Ancient Astrology"],
          url: SITE_URL,
          description: "Step into the timeless legacy of Katyayani Ancient Astrology 'KVA', where centuries-old Brahmin traditions meet 21st-century wisdom.",
          publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-IN",
      },
      ORG_SCHEMA,
        {
          "@type": "ProfessionalService",
          "@id": `${SITE_URL}/#service`,
          name: "Katyaayani Astrologer",
          url: SITE_URL,
          image: OG_IMAGE,
          logo: LOGO_URL,
          description: "Step into the timeless legacy of Katyayani Ancient Astrology 'KVA', where centuries-old Brahmin traditions meet 21st-century wisdom.",
          serviceType: "Ancient Astrology Consultation",
        areaServed: { "@type": "Country", name: "India" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Astrology Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kundali Analysis" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Horoscope Reading" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Vastu Consultation" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Marriage Matching" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Online Consultation" } },
          ],
        },
      },
    ],
  },
  "/services": {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Astrology Services by Katyaayani",
    url: `${SITE_URL}/services`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Kundali Analysis", url: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 2, name: "Horoscope Reading", url: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: "Vastu Shastra", url: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 4, name: "Marriage Matching", url: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 5, name: "Online Consultation", url: `${SITE_URL}/online-consulting` },
    ],
  },
  "/about": {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Katyaayani Astrologer",
    url: `${SITE_URL}/about`,
    mainEntity: ORG_SCHEMA,
  },
  "/contact": {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Katyaayani Astrologer",
    url: `${SITE_URL}/contact`,
    mainEntity: ORG_SCHEMA,
  },
  "/blog": {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Katyaayani Astrologer Blog",
    url: `${SITE_URL}/blog`,
      description: "Ancient astrology articles, horoscope insights, kundali tips & spiritual guidance.",
    publisher: ORG_SCHEMA,
  },
  "/rashifal": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Daily Rashifal - Katyaayani Astrologer",
    url: `${SITE_URL}/rashifal`,
    description: "Daily rashifal (horoscope) for all 12 zodiac signs in Gujarati, Hindi & English.",
  },
  "/horoscope": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Horoscope - Katyaayani Astrologer",
    url: `${SITE_URL}/horoscope`,
    description: "Daily, weekly & monthly horoscope predictions for all zodiac signs.",
  },
  "/online-consulting": {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Online Astrology Consultation",
    url: `${SITE_URL}/online-consulting`,
    provider: ORG_SCHEMA,
      serviceType: "Online Ancient Astrology Consultation",
    areaServed: { "@type": "Country", name: "India" },
  },
  "/booking": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Book Appointment - Katyaayani Astrologer",
    url: `${SITE_URL}/booking`,
    description: "Book your astrology consultation appointment with Katyaayani Astrologer.",
  },
  "/hindu-calendar": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Hindu Calendar - Katyaayani Astrologer",
    url: `${SITE_URL}/hindu-calendar`,
    description: "Hindu Panchang calendar with tithi, nakshatra, muhurat & festival dates.",
  },
  "/important-days": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Important Days & Festivals - Katyaayani Astrologer",
    url: `${SITE_URL}/important-days`,
    description: "Important Hindu festivals, vrat, ekadashi & auspicious dates.",
  },
};

export default function SchemaMarkup() {
  const pathname = usePathname();
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    fetch(`/api/admin/seo?page_path=${encodeURIComponent(pathname)}`)
      .then((res) => { if (!res.ok) throw new Error('not ok'); return res.json(); })
      .then((data) => {
        if (data.success && data.data?.schema_markup) {
          setSchema(data.data.schema_markup);
        } else {
          // Fallback to default schema
            setSchema(SCHEMA_DEFAULTS[pathname] || {
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: document.title,
              url: `${SITE_URL}${pathname}`,
              isPartOf: { "@id": `${SITE_URL}/#website` },
            });
        }
      })
      .catch(() => setSchema(null));
  }, [pathname]);

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SITE_URL = "https://www.katyaayaniastrologer.com";
const LOGO_URL = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/c601c1cc-61c8-474d-bbc9-2026bfe37c34/logo_withoutname-removebg-1767251276652.png?width=256&height=256&resize=contain";
const OG_IMAGE = "https://www.katyaayaniastrologer.com/opengraph-image";

const ORG_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Katyayani Vedic Astrology",
  alternateName: "Katyaayani Astrologer",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 256,
    height: 256,
  },
  image: OG_IMAGE,
  description: "Step into the timeless legacy of Katyayani Vedic Astrology 'KVA', where centuries-old Brahmin traditions meet 21st-century wisdom.",
  foundingDate: "2007",
  founder: {
    "@type": "Person",
    "@id": `${SITE_URL}/#founder`,
    name: "Rudram Joshi",
    image: OG_IMAGE,
    jobTitle: "Founder & Chief Vedic Astrologer",
    worksFor: { "@id": `${SITE_URL}/#organization` },
  },
  areaServed: { "@type": "Country", name: "India" },
  serviceType: ["Vedic Astrology", "Kundali Analysis", "Horoscope Reading", "Vastu Shastra", "Marriage Matching"],
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
          name: "Katyayani Vedic Astrology",
          alternateName: "Katyaayani Astrologer",
          url: SITE_URL,
          description: "Step into the timeless legacy of Katyayani Vedic Astrology 'KVA', where centuries-old Brahmin traditions meet 21st-century wisdom.",
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
          name: "Katyayani Vedic Astrology",
          url: SITE_URL,
          image: OG_IMAGE,
          logo: LOGO_URL,
          description: "Step into the timeless legacy of Katyayani Vedic Astrology 'KVA', where centuries-old Brahmin traditions meet 21st-century wisdom.",
        serviceType: "Vedic Astrology Consultation",
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
    description: "Vedic astrology articles, horoscope insights, kundali tips & spiritual guidance.",
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
    serviceType: "Online Vedic Astrology Consultation",
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

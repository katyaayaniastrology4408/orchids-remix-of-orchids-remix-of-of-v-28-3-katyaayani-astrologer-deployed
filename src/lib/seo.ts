import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = "https://katyaayaniastrologer.com";
const SITE_NAME = "Katyaayani Astrologer";

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }) },
  });
}

// ─── Auto Slug Generator ───
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Default Meta Fallbacks Per Page ───
const PAGE_DEFAULTS: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: "Katyaayani Astrologer - Best Vedic Astrologer | Kundali, Horoscope & Jyotish Consultation",
    description: "Katyaayani Astrologer (Rudram Joshi) - Expert Vedic astrology consultations, kundali analysis, horoscope readings, vastu shastra & personalized remedies since 2007. Book online or home consultation today.",
    keywords: "katyaayani astrologer, katyaayani jyotish, vedic astrologer, best astrologer, kundali analysis, horoscope reading, jyotish consultation, astrology online, vastu shastra, rudram joshi astrologer, indian astrology, birth chart analysis, rashifal, panchang, hindu calendar, astrology consultation online, best vedic astrologer india, kundali matching, marriage astrology, career astrology, health astrology, astrology remedies, કાત્યાયની જ્યોતિષ, कात्यायनी ज्योतिष",
  },
  "/about": {
    title: "About Katyaayani Astrologer (Rudram Joshi) - Trusted Vedic Astrologer Since 2007",
    description: "Learn about Katyaayani Astrologer (Rudram Joshi) - a trusted Vedic astrology expert with 17+ years experience offering kundali analysis, horoscope readings, vastu consultation & spiritual guidance.",
    keywords: "about katyaayani astrologer, rudram joshi astrologer, vedic astrologer experience, trusted astrologer india, katyaayani jyotish about",
  },
  "/services": {
    title: "Astrology Services - Kundali, Horoscope, Vastu & Marriage Matching | Katyaayani",
    description: "Explore Katyaayani Astrologer's services: kundali analysis, horoscope reading, kundali matching for marriage, vastu shastra, career astrology, health astrology & personalized Vedic remedies.",
    keywords: "astrology services, kundali matching, horoscope analysis, vastu shastra consultation, marriage astrology, career astrology, gemstone recommendation, vedic remedies, katyaayani services",
  },
  "/booking": {
    title: "Book Astrology Consultation Online | Katyaayani Astrologer",
    description: "Book your personalized Vedic astrology consultation with Katyaayani Astrologer. Choose online video call or in-person home visit sessions. Easy booking, trusted astrologer.",
    keywords: "book astrology appointment, online astrology consultation, astrology booking, katyaayani booking, vedic consultation appointment, astrologer near me",
  },
  "/blog": {
    title: "Astrology Blog - Vedic Insights, Horoscope Updates & Spiritual Wisdom | Katyaayani",
    description: "Read the latest astrology articles, Vedic insights, horoscope updates, rashifal predictions, panchang information & spiritual wisdom from Katyaayani Astrologer.",
    keywords: "astrology blog, vedic knowledge, horoscope updates, spiritual articles, astrology tips, katyaayani blog, jyotish articles",
  },
  "/horoscope": {
    title: "Daily Horoscope - Today's Zodiac Predictions | Katyaayani Astrologer",
    description: "Get accurate daily horoscope predictions for all 12 zodiac signs by Katyaayani Astrologer. Personalized Vedic astrology forecasts for love, career, health & finance.",
    keywords: "daily horoscope, zodiac predictions, today horoscope, astrology forecast, rashi, horoscope today, katyaayani horoscope, zodiac signs daily",
  },
  "/rashifal": {
    title: "Rashifal - Daily Rashi Predictions | Katyaayani Astrologer",
    description: "Read your daily rashifal and rashi predictions by Katyaayani Astrologer. Accurate Vedic astrology forecasts in Hindi & Gujarati for all zodiac signs.",
    keywords: "rashifal, rashi, daily rashifal, aaj ka rashifal, rashi bhavishya, vedic astrology hindi, rashifal today, katyaayani rashifal, રાશિફળ",
  },
  "/hindu-calendar": {
    title: "Hindu Calendar 2026 - Panchang, Tithi & Nakshatra | Katyaayani Astrologer",
    description: "Check the Hindu calendar with daily panchang, tithi, nakshatra, yoga, karana & auspicious muhurat timings. Plan your rituals and ceremonies with Katyaayani Astrologer.",
    keywords: "hindu calendar 2026, panchang today, tithi today, nakshatra, muhurat, hindu panchang, katyaayani panchang, vikram samvat, હિંદુ કેલેન્ડર",
  },
  "/important-days": {
    title: "Important Hindu Festivals & Vrat Days 2026 | Katyaayani Astrologer",
    description: "Discover important Hindu festivals, vrat dates, ekadashi, purnima, amavasya & auspicious days with detailed panchang information by Katyaayani Astrologer.",
    keywords: "hindu festivals 2026, vrat dates, important hindu days, ekadashi dates, purnima dates, amavasya dates, katyaayani festivals",
  },
  "/online-consulting": {
    title: "Online Astrology Consultation - Video Call Sessions Worldwide | Katyaayani",
    description: "Get expert Vedic astrology consultation online via video call with Katyaayani Astrologer. Available worldwide. Convenient, personalized & accurate kundali and horoscope sessions.",
    keywords: "online astrology consultation, virtual astrology session, video call astrology, online kundali reading, astrologer online, katyaayani online consultation, worldwide astrology",
  },
  "/feedback": {
    title: "Client Reviews & Testimonials | Katyaayani Astrologer",
    description: "Read genuine testimonials and reviews from satisfied clients of Katyaayani Astrologer. Trusted by hundreds of clients for Vedic astrology consultations since 2007.",
    keywords: "katyaayani astrologer reviews, astrology testimonials, client feedback, astrologer reviews, trusted astrologer reviews",
  },
};

// ─── Schema.org Generator ───
export function generateSchemaMarkup(pagePath: string, seoData?: { meta_title?: string; meta_description?: string; og_image?: string }): Record<string, unknown> {
  const title = seoData?.meta_title || PAGE_DEFAULTS[pagePath]?.title || SITE_NAME;
  const description = seoData?.meta_description || PAGE_DEFAULTS[pagePath]?.description || "";
  const image = seoData?.og_image || `${SITE_URL}/og-image.jpg`;
  const url = `${SITE_URL}${pagePath === "/" ? "" : pagePath}`;

  // Base Organization schema (always included)
  const organization = {
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ["Katyaayani Jyotish", "કાત્યાયની જ્યોતિષ", "कात्यायनी ज्योतिष"],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi", "Gujarati"],
    },
  };

  if (pagePath === "/") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: SITE_NAME,
          alternateName: ["Katyaayani Jyotish", "કાત્યાયની જ્યોતિષ", "कात्यायनी ज्योतिष"],
          url: SITE_URL,
          description,
          inLanguage: ["en", "hi", "gu"],
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/blog?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        organization,
        {
          "@type": "ProfessionalService",
          name: SITE_NAME,
          alternateName: "Katyaayani Jyotish",
          description,
          url: SITE_URL,
          image,
          priceRange: "$$",
          serviceType: ["Vedic Astrology Consultation", "Kundali Analysis", "Horoscope Reading", "Vastu Shastra", "Marriage Matching"],
          areaServed: {
            "@type": "Country",
            name: "India",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Astrology Services",
            itemListElement: [
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Vedic Kundali Analysis" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Horoscope & Rashifal Reading" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kundali Matching for Marriage" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Vastu Shastra Consultation" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Online Video Call Consultation" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home Visit Astrology Session" } },
            ],
          },
        },
        {
          "@type": "Person",
          name: "Rudram Joshi",
          alternateName: "Katyaayani Astrologer",
          jobTitle: "Vedic Astrologer",
          url: SITE_URL,
          image,
          knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Kundali Analysis", "Vastu Shastra", "Horoscope Reading"],
          worksFor: organization,
        },
      ],
    };
  }

  if (pagePath === "/about") {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: title,
      description,
      url,
      mainEntity: {
        "@type": "Person",
        name: "Katyaayani",
        jobTitle: "Vedic Astrologer",
        url: SITE_URL,
        image,
      },
    };
  }

  if (pagePath === "/services") {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: title,
      description,
      url,
      provider: organization,
      serviceType: "Vedic Astrology Services",
    };
  }

  if (pagePath === "/booking") {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      potentialAction: {
        "@type": "ReserveAction",
        target: url,
        name: "Book Consultation",
      },
    };
  }

  if (pagePath === "/blog") {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: title,
      description,
      url,
      publisher: organization,
    };
  }

  if (pagePath === "/feedback") {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
    };
  }

  // Default WebPage schema
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

// ─── SEO Audit Checker ───
export interface SeoAuditIssue {
  type: "error" | "warning" | "info";
  field: string;
  message: string;
}

export interface SeoAuditResult {
  page_path: string;
  score: number;
  issues: SeoAuditIssue[];
  hasTitle: boolean;
  hasDescription: boolean;
  hasKeywords: boolean;
  hasOgTags: boolean;
  hasCanonical: boolean;
  hasSchema: boolean;
}

export function auditSeoEntry(entry: Record<string, any>): SeoAuditResult {
  const issues: SeoAuditIssue[] = [];
  let score = 100;

  const hasTitle = !!entry.meta_title;
  const hasDescription = !!entry.meta_description;
  const hasKeywords = !!entry.meta_keywords;
  const hasOgTitle = !!entry.og_title;
  const hasOgDescription = !!entry.og_description;
  const hasOgImage = !!entry.og_image;
  const hasCanonical = !!entry.canonical_url;
  const hasSchema = !!entry.schema_markup;

  // Title checks
  if (!hasTitle) {
    issues.push({ type: "error", field: "meta_title", message: "Missing meta title" });
    score -= 15;
  } else {
    if (entry.meta_title.length < 30) {
      issues.push({ type: "warning", field: "meta_title", message: `Title too short (${entry.meta_title.length}/30 min)` });
      score -= 5;
    }
    if (entry.meta_title.length > 60) {
      issues.push({ type: "warning", field: "meta_title", message: `Title too long (${entry.meta_title.length}/60 max)` });
      score -= 5;
    }
  }

  // Description checks
  if (!hasDescription) {
    issues.push({ type: "error", field: "meta_description", message: "Missing meta description" });
    score -= 15;
  } else {
    if (entry.meta_description.length < 70) {
      issues.push({ type: "warning", field: "meta_description", message: `Description too short (${entry.meta_description.length}/70 min)` });
      score -= 5;
    }
    if (entry.meta_description.length > 160) {
      issues.push({ type: "warning", field: "meta_description", message: `Description too long (${entry.meta_description.length}/160 max)` });
      score -= 5;
    }
  }

  // Keywords
  if (!hasKeywords) {
    issues.push({ type: "warning", field: "meta_keywords", message: "No keywords set" });
    score -= 5;
  }

  // Open Graph
  if (!hasOgTitle) {
    issues.push({ type: "warning", field: "og_title", message: "Missing OG title" });
    score -= 5;
  }
  if (!hasOgDescription) {
    issues.push({ type: "warning", field: "og_description", message: "Missing OG description" });
    score -= 5;
  }
  if (!hasOgImage) {
    issues.push({ type: "warning", field: "og_image", message: "Missing OG image" });
    score -= 5;
  }

  // Canonical
  if (!hasCanonical) {
    issues.push({ type: "info", field: "canonical_url", message: "No canonical URL set" });
    score -= 5;
  }

  // Schema
  if (!hasSchema) {
    issues.push({ type: "warning", field: "schema_markup", message: "No schema markup (JSON-LD)" });
    score -= 10;
  }

  // Robots
  if (entry.robots === "noindex, nofollow") {
    issues.push({ type: "info", field: "robots", message: "Page set to noindex, nofollow" });
  }

  return {
    page_path: entry.page_path,
    score: Math.max(0, score),
    issues,
    hasTitle,
    hasDescription,
    hasKeywords,
    hasOgTags: hasOgTitle && hasOgDescription && hasOgImage,
    hasCanonical,
    hasSchema,
  };
}

// ─── Meta Fallback System ───
export async function getSeoMetadata(pagePath: string): Promise<Metadata> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("page_path", pagePath)
      .maybeSingle();

    const defaults = PAGE_DEFAULTS[pagePath];
    const baseUrl = SITE_URL;
    const canonicalUrl = `${baseUrl}${pagePath === "/" ? "" : pagePath}`;

    const metadata: Metadata = {};

    // Title: DB -> fallback
    const title = data?.meta_title || defaults?.title;
    if (title) metadata.title = title;

    // Description: DB -> fallback
    const description = data?.meta_description || defaults?.description;
    if (description) metadata.description = description;

    // Keywords: DB -> fallback
    const keywords = data?.meta_keywords || defaults?.keywords;
    if (keywords) {
      metadata.keywords = keywords.split(",").map((k: string) => k.trim());
    }

    // Robots: DB -> default index,follow
    metadata.robots = data?.robots || "index, follow";

    // Open Graph: DB -> auto from title/description
    const ogTitle = data?.og_title || title;
    const ogDescription = data?.og_description || description;
    const ogImage = data?.og_image;

    const openGraph: Record<string, unknown> = {
      type: "website",
      siteName: SITE_NAME,
      url: canonicalUrl,
    };
    if (ogTitle) openGraph.title = ogTitle;
    if (ogDescription) openGraph.description = ogDescription;
    if (ogImage) openGraph.images = [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }];
    metadata.openGraph = openGraph as Metadata["openGraph"];

    // Twitter card
    metadata.twitter = {
      card: "summary_large_image",
      title: (ogTitle as string) || undefined,
      description: (ogDescription as string) || undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    };

    // Canonical: DB -> auto-generate
    metadata.alternates = {
      canonical: data?.canonical_url || canonicalUrl,
    };

    return metadata;
  } catch {
    // Even on error, return safe fallbacks
    const defaults = PAGE_DEFAULTS[pagePath];
    if (defaults) {
      return {
        title: defaults.title,
        description: defaults.description,
        keywords: defaults.keywords.split(",").map((k) => k.trim()),
        robots: "index, follow",
      };
    }
    return {};
  }
}

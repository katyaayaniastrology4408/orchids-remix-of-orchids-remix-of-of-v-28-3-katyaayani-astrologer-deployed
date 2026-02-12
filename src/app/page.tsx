import { Metadata } from "next";
import { getSeoMetadata, generateSchemaMarkup } from "@/lib/seo";
import HomePageClient from "@/components/homepage/HomePageClient";

const SITE_URL = "https://katyaayaniastrologer.com";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("/");
  
  return {
    title: (seo.title as string) || "Katyaayani Astrologer - Best Vedic Astrologer | Kundali, Horoscope & Jyotish Consultation",
    description: seo.description || "Katyaayani Astrologer (Rudram Joshi) - Expert Vedic astrology consultations, kundali analysis, horoscope readings, vastu shastra, and personalized remedies. Trusted astrologer since 2007. Book online or home consultation today.",
    keywords: (seo.keywords as string[]) || [
      "katyaayani astrologer", "katyaayani jyotish", "vedic astrologer", "best astrologer",
      "kundali analysis", "horoscope reading", "jyotish consultation", "astrology online",
      "vastu shastra", "rudram joshi astrologer", "indian astrology", "birth chart analysis",
      "rashifal", "panchang", "hindu calendar", "astrology consultation online",
      "best vedic astrologer india", "kundali matching", "marriage astrology",
      "career astrology", "health astrology", "astrology remedies",
      "કાત્યાયની જ્યોતિષ", "જ્યોતિષ પરામર્શ", "कात्यायनी ज्योतिष"
    ],
    robots: seo.robots || "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    openGraph: {
      ...(seo.openGraph as Record<string, unknown>),
      type: "website",
      siteName: "Katyaayani Astrologer",
      url: SITE_URL,
      title: "Katyaayani Astrologer - Expert Vedic Astrology & Jyotish Consultations",
      description: "Unlock Vedic wisdom with Katyaayani Astrologer (Rudram Joshi). Expert kundali analysis, horoscope readings, vastu consultation & personalized remedies since 2007.",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: "Katyaayani Astrologer - Expert Vedic Astrology Consultations",
      description: "Unlock Vedic wisdom with Katyaayani Astrologer. Expert kundali, horoscope & jyotish consultations since 2007.",
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        "en-IN": SITE_URL,
        "hi-IN": SITE_URL,
        "gu-IN": SITE_URL,
      },
    },
    other: {
      "geo.region": "IN",
      "geo.placename": "India",
      "revisit-after": "3 days",
      "rating": "general",
    },
  };
}

export default function HomePage() {
  const schema = generateSchemaMarkup("/");

  return (
    <>
      {/* Server-rendered structured data for SEO crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hidden SEO content visible to crawlers but not disruptive to users */}
      <div className="sr-only">
        <h1>Katyaayani Astrologer - Best Vedic Astrologer for Kundali, Horoscope & Jyotish Consultation</h1>
        <p>
          Katyaayani Astrologer (Rudram Joshi) is a trusted Vedic astrologer offering expert astrology consultations since 2007. 
          Our services include kundali analysis, horoscope reading, rashifal predictions, vastu shastra consultation, 
          marriage and kundali matching, career astrology, health astrology, and personalized Vedic remedies.
        </p>
        <p>
          Book your astrology consultation online or at home. We serve clients worldwide through video call consultations 
          and in-person sessions. Get accurate birth chart analysis, daily horoscope predictions, Hindu panchang, 
          nakshatra analysis, and spiritual guidance from an experienced Vedic astrologer.
        </p>
        <h2>Our Astrology Services</h2>
        <ul>
          <li>Vedic Kundali Analysis &amp; Birth Chart Reading</li>
          <li>Horoscope &amp; Rashifal Predictions</li>
          <li>Kundali Matching for Marriage</li>
          <li>Vastu Shastra Consultation</li>
          <li>Career &amp; Business Astrology</li>
          <li>Health &amp; Wellness Astrology</li>
          <li>Gemstone &amp; Remedy Recommendations</li>
          <li>Daily Panchang &amp; Hindu Calendar</li>
          <li>Online Video Call Consultations</li>
          <li>Home Visit Astrology Sessions</li>
        </ul>
        <h2>કાત્યાયની જ્યોતિષ - વૈદિક જ્યોતિષ પરામર્શ</h2>
        <p>
          કાત્યાયની જ્યોતિષ (રુદ્રમ જોશી) 2007 થી વૈદિક જ્યોતિષ પરામર્શ, કુંડળી વિશ્લેષણ, 
          રાશિફળ, વાસ્તુ શાસ્ત્ર અને વ્યક્તિગત ઉપાયો પ્રદાન કરે છે.
        </p>
        <h2>कात्यायनी ज्योतिष - वैदिक ज्योतिष परामर्श</h2>
        <p>
          कात्यायनी ज्योतिष (रुद्रम जोशी) 2007 से वैदिक ज्योतिष परामर्श, कुंडली विश्लेषण, 
          राशिफल, वास्तु शास्त्र और व्यक्तिगत उपाय प्रदान करते हैं।
        </p>
      </div>

      {/* Interactive client-side homepage */}
      <HomePageClient />
    </>
  );
}

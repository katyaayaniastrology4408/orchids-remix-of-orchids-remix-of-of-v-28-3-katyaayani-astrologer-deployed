import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import UnifiedLoginPopup from "@/components/auth/UnifiedLoginPopup";
import EnquiryPopup from "@/components/EnquiryPopup";
import FloatingEnquiry from "@/components/FloatingEnquiry";
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";
import UserAlertsPopup from "@/components/UserAlertsPopup";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PageViewTracker from "@/components/PageViewTracker";
import NewsletterPopup from "@/components/NewsletterPopup";
import SchemaMarkup from "@/components/SchemaMarkup";

const ICON_BASE = 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/c601c1cc-61c8-474d-bbc9-2026bfe37c34/logo_withoutname-removebg-1767251276652.png';

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = "https://www.katyaayaniastrologer.com";
  const OG_IMAGE = `${ICON_BASE}?width=1200&height=630&resize=contain`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Katyaayani Astrologer - Best Vedic Astrologer | Kundali, Horoscope & Jyotish",
      template: "%s | Katyaayani Astrologer",
    },
    description: "Katyaayani Astrologer (Rudram Joshi) - Expert Vedic astrology consultations, kundali analysis, horoscope readings, vastu shastra & personalized remedies since 2007. Book online consultation today.",
    keywords: [
      "katyaayani astrologer", "katyaayani jyotish", "vedic astrologer", "best astrologer india",
      "kundali", "horoscope", "jyotish", "astrology consultation", "vastu shastra", "rashifal",
      "rudram joshi astrologer", "kundali matching", "marriage astrology", "online astrology consultation",
      "કાત્યાયની જ્યોતિષ", "कात्यायनी ज्योतिष"
    ],
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Katyaayani Astrologer",
      url: SITE_URL,
      locale: "en_IN",
      title: "Katyaayani Astrologer - Best Vedic Astrologer | Kundali, Horoscope & Jyotish",
      description: "Expert Vedic astrology consultations, kundali analysis, horoscope readings, vastu shastra & personalized remedies since 2007.",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Katyaayani Astrologer - Vedic Astrology Consultations",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Katyaayani Astrologer - Best Vedic Astrologer",
      description: "Expert Vedic astrology consultations, kundali analysis, horoscope readings & personalized remedies since 2007.",
      images: [OG_IMAGE],
    },
    alternates: {
      canonical: SITE_URL,
    },
    icons: {
      icon: [
        { url: `${ICON_BASE}?width=256&height=256&resize=contain`, type: 'image/png', sizes: '256x256' },
        { url: `${ICON_BASE}?width=64&height=64&resize=contain`, type: 'image/png', sizes: '64x64' },
        { url: `${ICON_BASE}?width=32&height=32&resize=contain`, type: 'image/png', sizes: '32x32' },
      ],
      apple: [
        { url: `${ICON_BASE}?width=180&height=180&resize=contain`, type: 'image/png', sizes: '180x180' },
      ],
    },
    other: {
      "geo.region": "IN",
      "geo.placename": "India",
      "revisit-after": "3 days",
      "rating": "general",
      "language": "English, Hindi, Gujarati",
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <head>
          {/* Additional Google Search Console Verification */}
          <meta name="google-site-verification" content="JC618JFaR6PWY6n1KlEKLwBnTB2Qekmi-2rjnke5S5M" />
        </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) - GTM-MQDMP2SL */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MQDMP2SL"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* Google Tag Manager (noscript) - GTM-PG9WBFK9 */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PG9WBFK9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
          {/* Google Tag Manager - GTM-MQDMP2SL */}
          <Script id="gtm-mqdmp2sl" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MQDMP2SL');`}
          </Script>
          {/* Google Tag Manager - GTM-PG9WBFK9 */}
          <Script id="gtm-pg9wbfk9" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PG9WBFK9');`}
          </Script>
          {/* Google Analytics GA4 - G-ZB6X0EHGE0 */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-ZB6X0EHGE0"
            strategy="beforeInteractive"
          />
          <Script id="ga4-old" strategy="beforeInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-ZB6X0EHGE0');`}
          </Script>
          {/* Google Analytics GA4 - G-D13ED7NS0T */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-D13ED7NS0T"
            strategy="beforeInteractive"
          />
          <Script id="ga4-new" strategy="beforeInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-D13ED7NS0T');`}
          </Script>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="feddd196-43f2-42e9-baf7-609957a7854f"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
            <Providers>
                        {children}
                        <UnifiedLoginPopup />
                        <EnquiryPopup />
                          <FloatingEnquiry />
            <FloatingWhatsApp />
                            <UserAlertsPopup />
                        <PageViewTracker />
                        <NewsletterPopup />
                        <SchemaMarkup />
                      </Providers>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
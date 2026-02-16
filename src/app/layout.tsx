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

const SITE_URL = "https://www.katyaayaniastrologer.com";
const OG_IMAGE = `${ICON_BASE}?width=1200&height=630&resize=contain`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Katyaayani Astrologer - Best Vedic Astrologer | Kundali, Horoscope & Jyotish",
    template: "%s | Katyaayani Astrologer",
  },
  description: "Katyaayani Astrologer connects modern times with ancient astrology, blending ancient wisdom with today's technology to provide accurate guidance, practical solutions, and personalized remedies. Expert Vedic astrology consultations, kundali analysis, horoscope readings, vastu shastra since 2007. Book online consultation today.",
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
    description: "Katyaayani Astrologer connects modern times with ancient astrology, blending ancient wisdom with today's technology. Expert kundali analysis, horoscope readings, vastu consultation & personalized remedies since 2007.",
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
    description: "Katyaayani Astrologer connects modern times with ancient astrology. Expert kundali, horoscope & jyotish consultations since 2007.",
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
        "geo.position": "23.0225;72.5714",
        "ICBM": "23.0225, 72.5714",
        "revisit-after": "3 days",
        "rating": "general",
        "language": "English, Hindi, Gujarati",
        "msapplication-TileColor": "#FF6B00",
        "msapplication-config": "/browserconfig.xml",
        "apple-mobile-web-app-title": "Katyaayani Astrologer",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "application-name": "Katyaayani Astrologer",
        "theme-color": "#FF6B00",
        "mobile-web-app-capable": "yes",
        "format-detection": "telephone=no",
        "distribution": "global",
        "target": "all",
        "audience": "all",
        "coverage": "Worldwide",
        "classification": "Astrology, Jyotish, Vedic Astrology",
        "subject": "Vedic Astrology Consultation & Services",
        "copyright": "Katyaayani Astrologer",
        "designer": "Katyaayani Astrologer",
        "owner": "Katyaayani Astrologer",
        "url": "https://www.katyaayaniastrologer.com",
        "identifier-URL": "https://www.katyaayaniastrologer.com",
        "directory": "submission",
        "pagename": "Katyaayani Astrologer - Best Vedic Astrologer",
        "HandheldFriendly": "True",
        "MobileOptimized": "320",
      },
      verification: {
        google: ["2Edo_sTI7Jp85F7z7xr0yG6MTSrSsm5WO0jY4HsAqmM", "JC618JFaR6PWY6n1KlEKLwBnTB2Qekmi-2rjnke5S5M"],
        yandex: "yandex-verification-code",
        other: {
          "msvalidate.01": "bing-verification-code",
          "p:domain_verify": "pinterest-verification-code",
        },
      },
    manifest: "/manifest.json",
    category: "astrology",
    creator: "Katyaayani Astrologer",
    publisher: "Katyaayani Astrologer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
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
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SCHEMA_DEFAULTS: Record<string, Record<string, unknown>> = {
  "/": {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Katyaayani Astrologer", url: typeof window !== "undefined" ? window.location.origin : "" },
      { "@type": "ProfessionalService", name: "Katyaayani Astrologer", serviceType: "Vedic Astrology Consultation" },
    ],
  },
};

export default function SchemaMarkup() {
  const pathname = usePathname();
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    fetch(`/api/admin/seo?page_path=${encodeURIComponent(pathname)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.schema_markup) {
          setSchema(data.data.schema_markup);
        } else {
          // Fallback to default schema
          setSchema(SCHEMA_DEFAULTS[pathname] || {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: document.title,
            url: window.location.href,
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

import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export const alt = "Katyaayani Astrologer - Best Vedic Astrologer in India | Founder Kumar Rishi in traditional attire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_URL = "https://eochjxjoyibtjawzgauk.supabase.co/storage/v1/object/public/LOGO/favicon_bg_fixed.ico";

async function getSettings() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=key,value`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const settings: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value;
    });
    return settings;
  } catch {
    return {};
  }
}

export default async function Image() {
  const settings = await getSettings();

  const logoUrl = settings.logo_url || LOGO_URL;
  const siteName = settings.site_name || "Katyaayani Astrologer";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1a0a2e 0%, #2d1140 25%, #1a0a2e 50%, #0d0518 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 500,
            height: 500,
            transform: "translate(-50%, -55%)",
            background: "radial-gradient(circle, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0.05) 40%, transparent 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Outer decorative border */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "2px solid rgba(255, 107, 0, 0.25)",
            borderRadius: 20,
            display: "flex",
          }}
        />

        {/* Inner decorative border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "1px solid rgba(255, 107, 0, 0.12)",
            borderRadius: 16,
            display: "flex",
          }}
        />

        {/* Corner accents - top left */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            width: 50,
            height: 50,
            borderTop: "3px solid #ff6b00",
            borderLeft: "3px solid #ff6b00",
            borderRadius: "8px 0 0 0",
            display: "flex",
          }}
        />
        {/* Corner accents - top right */}
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            width: 50,
            height: 50,
            borderTop: "3px solid #ff6b00",
            borderRight: "3px solid #ff6b00",
            borderRadius: "0 8px 0 0",
            display: "flex",
          }}
        />
        {/* Corner accents - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 28,
            width: 50,
            height: 50,
            borderBottom: "3px solid #ff6b00",
            borderLeft: "3px solid #ff6b00",
            borderRadius: "0 0 0 8px",
            display: "flex",
          }}
        />
        {/* Corner accents - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            width: 50,
            height: 50,
            borderBottom: "3px solid #ff6b00",
            borderRight: "3px solid #ff6b00",
            borderRadius: "0 0 8px 0",
            display: "flex",
          }}
        />

        {/* Logo - large and prominent with glow ring */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,107,0,0.05))",
            border: "4px solid #ff6b00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: "0 0 60px rgba(255,107,0,0.3), 0 0 120px rgba(255,107,0,0.1)",
          }}
        >
          <img
            src={logoUrl}
            width={160}
            height={160}
            style={{
              borderRadius: "50%",
              objectFit: "contain",
            }}
            alt="Katyaayani Logo"
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            letterSpacing: "-1px",
          }}
        >
          <span>{siteName.split(" ")[0] || "Katyaayani"}</span>
          <span style={{ color: "#ff6b00", marginTop: 2, fontSize: 48 }}>
            {siteName.split(" ").slice(1).join(" ") || "Astrologer"}
          </span>
        </div>

        {/* Divider line */}
        <div
          style={{
            width: 120,
            height: 2,
            background: "linear-gradient(90deg, transparent, #ff6b00, transparent)",
            marginTop: 16,
            marginBottom: 12,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            display: "flex",
            fontWeight: 500,
          }}
        >
          Best Vedic Astrologer | Kundali | Horoscope | Jyotish
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.45)",
            marginTop: 8,
            display: "flex",
          }}
        >
          Expert Astrology Consultations Since 2007
        </div>

        {/* CTA Button */}
        <div
          style={{
            marginTop: 24,
            padding: "12px 40px",
            background: "linear-gradient(135deg, #ff6b00, #ff8533)",
            borderRadius: 50,
            fontSize: 17,
            fontWeight: 700,
            color: "#ffffff",
            display: "flex",
            boxShadow: "0 4px 20px rgba(255,107,0,0.4)",
          }}
        >
          Book Consultation Now
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            display: "flex",
            letterSpacing: "1px",
          }}
        >
          www.katyaayaniastrologer.com
        </div>

        {/* Founder credit - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 40,
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            display: "flex",
          }}
        >
          Founded by Kumar Rishi G
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

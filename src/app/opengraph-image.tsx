import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Katyaayani Astrologer - Best Vedic Astrologer in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoUrl =
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/c601c1cc-61c8-474d-bbc9-2026bfe37c34/logo_withoutname-removebg-1767251276652.png?width=200&height=200&resize=contain";

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
          background: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 60%, #0f0520 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            bottom: 16,
            border: "2px solid rgba(255, 107, 0, 0.3)",
            borderRadius: 24,
            display: "flex",
          }}
        />

        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            width: 60,
            height: 60,
            borderTop: "3px solid #ff6b00",
            borderLeft: "3px solid #ff6b00",
            borderRadius: "8px 0 0 0",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            width: 60,
            height: 60,
            borderBottom: "3px solid #ff6b00",
            borderRight: "3px solid #ff6b00",
            borderRadius: "0 0 8px 0",
            display: "flex",
          }}
        />

        {/* Logo */}
        <img
          src={logoUrl}
          width={140}
          height={140}
          style={{
            borderRadius: "50%",
            border: "3px solid #ff6b00",
            marginBottom: 24,
            background: "rgba(255,255,255,0.05)",
          }}
          alt="Logo"
        />

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Katyaayani</span>
          <span style={{ color: "#ff6b00", marginTop: 4 }}>Astrologer</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.8)",
            marginTop: 16,
            textAlign: "center",
            display: "flex",
          }}
        >
          Best Vedic Astrologer | Kundali | Horoscope | Jyotish
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            marginTop: 12,
            display: "flex",
          }}
        >
          Expert Astrology Consultations Since 2007
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 28,
            padding: "12px 36px",
            background: "linear-gradient(135deg, #ff6b00, #ff8533)",
            borderRadius: 50,
            fontSize: 18,
            fontWeight: 700,
            color: "#ffffff",
            display: "flex",
          }}
        >
          Book Consultation Now
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            display: "flex",
          }}
        >
          www.katyaayaniastrologer.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

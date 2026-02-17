import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Katyaayani Astrologer - Best Vedic Astrologer in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COVER_IMAGE_URL =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/82257351-6e7a-48cd-a2d1-b2ac49e135b9/coverimage-1771354510444.png?width=1200&height=630&resize=cover";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Cover image as full background */}
        <img
          src={COVER_IMAGE_URL}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          alt=""
        />

        {/* Dark overlay at bottom for text readability */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.80) 0%, transparent 100%)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 40px 18px",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 16,
              letterSpacing: "1px",
            }}
          >
            www.katyaayaniastrologer.com
          </span>
          <span
            style={{
              color: "#ff8c42",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            Best Vedic Astrologer Since 2007
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

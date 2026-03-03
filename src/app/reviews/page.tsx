import { Metadata } from "next";
import ReviewsClient from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Divine Reviews & Testimonials | Katyaayani Astrologer",
  description: "Read what our devotees say about their spiritual journey and astrology consultations with Rudram Joshi. Divine guidance and cosmic insights for your life path.",
  keywords: "astrology reviews, Rudram Joshi testimonials, Katyaayani Astrologer feedback, astrology success stories",
  openGraph: {
    title: "Divine Reviews & Testimonials | Katyaayani Astrologer",
    description: "Read what our devotees say about their spiritual journey and astrology consultations with Rudram Joshi.",
    images: ["https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/c601c1cc-61c8-474d-bbc9-2026bfe37c34/logo_withoutname-removebg-1767251276652.png"],
  }
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}

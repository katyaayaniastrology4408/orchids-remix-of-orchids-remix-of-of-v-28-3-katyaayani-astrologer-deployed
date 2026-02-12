import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("/rashifal");
  return { title: "Daily Horoscope", ...seo };
}

export default function RashifalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

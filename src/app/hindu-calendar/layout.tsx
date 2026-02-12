import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("/hindu-calendar");
  return { title: "Hindu Calendar", ...seo };
}

export default function HinduCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("/important-days");
  return { title: "Important Days", ...seo };
}

export default function ImportantDaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

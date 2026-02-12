import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("/online-consulting");
  return { title: "Online Consulting", ...seo };
}

export default function OnlineConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

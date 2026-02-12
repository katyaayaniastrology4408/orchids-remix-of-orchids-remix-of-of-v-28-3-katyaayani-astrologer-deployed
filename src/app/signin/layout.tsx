import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("/signin");
  return { title: "Sign In", ...seo };
}

export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

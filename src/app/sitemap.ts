import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// Generate multiple sitemaps: pages, blog, bookings, horoscope
export async function generateSitemaps() {
  return [
    { id: "pages" },
    { id: "blog" },
    { id: "bookings" },
    { id: "horoscope" },
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.katyaayaniastrologer.com";
  const supabase = getSupabase();

  if (id === "pages") {
    const staticPages: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
      { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${baseUrl}/horoscope`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
      { url: `${baseUrl}/rashifal`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
      { url: `${baseUrl}/hindu-calendar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
      { url: `${baseUrl}/important-days`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
      { url: `${baseUrl}/online-consulting`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/feedback`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/signin`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    const { data: pages } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("status", "published");

    const cmsPages: MetadataRoute.Sitemap = (pages || []).map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const { data: customEntries } = await supabase
      .from("sitemap_entries")
      .select("*")
      .eq("is_active", true);

    const customPages: MetadataRoute.Sitemap = (customEntries || []).map((entry) => ({
      url: `${baseUrl}${entry.url_path}`,
      lastModified: new Date(entry.last_modified || entry.updated_at),
      changeFrequency: (entry.change_frequency || "weekly") as "weekly",
      priority: Number(entry.priority) || 0.5,
    }));

    return [...staticPages, ...cmsPages, ...customPages];
  }

  if (id === "blog") {
    const { data: blogs } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("is_published", true);

    return (blogs || []).map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.updated_at || blog.published_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  if (id === "bookings") {
    return [
      { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
      { url: `${baseUrl}/online-consulting`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
      { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    ];
  }

  if (id === "horoscope") {
    const zodiacSigns = [
      "aries", "taurus", "gemini", "cancer", "leo", "virgo",
      "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
    ];

    const horoscopePages: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/horoscope`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
      { url: `${baseUrl}/rashifal`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
      { url: `${baseUrl}/hindu-calendar`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
      { url: `${baseUrl}/important-days`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    ];

    const signPages: MetadataRoute.Sitemap = zodiacSigns.map((sign) => ({
      url: `${baseUrl}/horoscope/${sign}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [...horoscopePages, ...signPages];
  }

  return [];
}

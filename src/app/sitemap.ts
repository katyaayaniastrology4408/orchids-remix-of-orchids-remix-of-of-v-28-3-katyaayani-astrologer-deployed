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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // HARDCODED: env var doesn't resolve on deployed server, causing localhost in sitemap
  const baseUrl = "https://www.katyaayaniastrologer.com";
  const supabase = getSupabase();

  // --- Static Pages ---
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/horoscope`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/rashifal`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/hindu-calendar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/important-days`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/online-consulting`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/kundli`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/feedback`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    // --- Gallery Page & Images ---
    let galleryEntry: MetadataRoute.Sitemap = [];
    try {
      const { data: galleryImages } = await supabase
        .from("gallery")
        .select("image_url, updated_at, created_at")
        .eq("is_active", true);

      const images = (galleryImages || []).map(img => img.image_url);
      const lastMod = galleryImages && galleryImages.length > 0 
        ? new Date(galleryImages[0].updated_at || galleryImages[0].created_at)
        : new Date();

      galleryEntry = [{
        url: `${baseUrl}/gallery`,
        lastModified: lastMod,
        changeFrequency: "daily",
        priority: 0.8,
        images: images
      }];
    } catch (e) { console.error("Sitemap gallery error:", e); }

    // --- Blog Posts ---
  let blogPages: MetadataRoute.Sitemap = [];
    try {
      const { data: blogs } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at, featured_image")
        .eq("is_published", true);

      blogPages = (blogs || []).map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updated_at || blog.published_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: blog.featured_image ? [blog.featured_image] : [],
      }));
    } catch (e) { console.error("Sitemap blog error:", e); }

  // --- CMS Pages ---
  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const { data: pages } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("status", "published");

    cmsPages = (pages || []).map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (e) { console.error("Sitemap CMS error:", e); }

  // --- Custom Sitemap Entries ---
  let customPages: MetadataRoute.Sitemap = [];
  try {
    const { data: customEntries } = await supabase
      .from("sitemap_entries")
      .select("*")
      .eq("is_active", true);

    customPages = (customEntries || []).map((entry) => ({
      url: `${baseUrl}${entry.url_path}`,
      lastModified: new Date(entry.last_modified || entry.updated_at),
      changeFrequency: (entry.change_frequency || "weekly") as "weekly",
      priority: Number(entry.priority) || 0.5,
    }));
    } catch (e) { console.error("Sitemap custom error:", e); }

    return [...staticPages, ...galleryEntry, ...blogPages, ...cmsPages, ...customPages];
}

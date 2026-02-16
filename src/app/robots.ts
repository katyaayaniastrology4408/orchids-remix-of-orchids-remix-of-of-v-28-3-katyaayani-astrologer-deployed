import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.katyaayaniastrologer.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "bingbot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "msnbot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || "4dc380408a8140fd8b67450af7964725";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.katyaayaniastrologer.com";
const HOST = new URL(SITE_URL).hostname;

// Submit URLs to IndexNow (Bing, Yandex, etc.)
export async function POST(req: NextRequest) {
  try {
    const { urls, action } = await req.json();

    // Action: ping sitemap (legacy ping)
    if (action === "ping-sitemap") {
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;
      const results: { target: string; status: string; statusCode?: number; error?: string }[] = [];

      // Ping Google
      try {
        const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
        results.push({ target: "Google", status: googleRes.ok ? "success" : "failed", statusCode: googleRes.status });
      } catch (e: unknown) {
        results.push({ target: "Google", status: "error", error: e instanceof Error ? e.message : "Unknown error" });
      }

      // Ping Bing
      try {
        const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
        results.push({ target: "Bing", status: bingRes.ok ? "success" : "failed", statusCode: bingRes.status });
      } catch (e: unknown) {
        results.push({ target: "Bing", status: "error", error: e instanceof Error ? e.message : "Unknown error" });
      }

      // Log each ping
      for (const r of results) {
        await supabase.from("ping_logs").insert({
          target: r.target,
          sitemap_url: sitemapUrl,
          status: r.status,
          status_code: r.statusCode || null,
          error_message: r.error || null,
        });
      }

      return NextResponse.json({ success: true, results });
    }

    // Action: IndexNow submit URLs
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ success: false, message: "No URLs provided" }, { status: 400 });
    }

    // Submit to IndexNow API (works for Bing, Yandex, Seznam, Naver)
    const indexNowEndpoints = [
      "https://api.indexnow.org/IndexNow",
      "https://www.bing.com/IndexNow",
    ];

    const allResults: { endpoint: string; status: string; statusCode?: number; error?: string }[] = [];

    for (const endpoint of indexNowEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            host: HOST,
            key: INDEXNOW_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
            urlList: urls.map((u: string) => u.startsWith("http") ? u : `${SITE_URL}${u}`),
          }),
        });

        const statusText = response.status === 200 ? "success" :
          response.status === 202 ? "accepted" : "failed";

        allResults.push({
          endpoint,
          status: statusText,
          statusCode: response.status,
        });
      } catch (e: unknown) {
        allResults.push({
          endpoint,
          status: "error",
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    // Log to ping_logs
    for (const r of allResults) {
      await supabase.from("ping_logs").insert({
        target: `IndexNow (${r.endpoint.includes("bing") ? "Bing" : "API"})`,
        sitemap_url: urls.join(", "),
        status: r.status,
        status_code: r.statusCode || null,
        error_message: r.error || null,
      });
    }

    return NextResponse.json({ success: true, results: allResults, urlCount: urls.length });
  } catch (error: unknown) {
    console.error("IndexNow error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Get ping logs
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ping_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, logs: data });
  } catch (error: unknown) {
    console.error("Ping logs error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || "a889b4f2a770404297f5fe6867c814f5";
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.katyaayaniastrologer.com").replace(/\/$/, "");
const HOST = new URL(SITE_URL).hostname; // "www.katyaayaniastrologer.com"

// The key file MUST be at the root of the domain. We serve it via a dedicated route.
// keyLocation always points to the production domain (not localhost).
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

async function submitIndexNow(urlList: string[]): Promise<{ target: string; status: string; statusCode?: number; body?: string }[]> {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const headers = { "Content-Type": "application/json; charset=utf-8" };
  const body = JSON.stringify(payload);

  const endpoints = [
    { label: "IndexNow API", url: "https://api.indexnow.org/IndexNow" },
    { label: "Bing", url: "https://www.bing.com/IndexNow" },
  ];

  const results = [];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(ep.url, { method: "POST", headers, body, signal: controller.signal });
      clearTimeout(timeout);
      const responseBody = await res.text().catch(() => "");
      const status = res.status === 200 || res.status === 202 ? "success" : "failed";
      results.push({ target: ep.label, status, statusCode: res.status, body: responseBody });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      results.push({ target: ep.label, status: "error", body: msg });
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urls, action, target } = body;

    // ─── Ping Sitemap ────────────────────────────────────────────────────────
    if (action === "ping-sitemap") {
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;
      const allResults: { target: string; status: string; statusCode?: number; message?: string }[] = [];

      const shouldGoogle = !target || target === "Google" || target === "all";
      const shouldBing   = !target || target === "Bing"   || target === "all";

      // Google deprecated their sitemap ping endpoint in Jan 2024.
      // The only way to submit to Google is via Search Console manually.
      if (shouldGoogle) {
        allResults.push({
          target: "Google",
          status: "info",
          message: "Google sitemap ping was deprecated in Jan 2024. Please submit via Google Search Console.",
        });
        await supabase.from("ping_logs").insert({
          target: "Google",
          sitemap_url: sitemapUrl,
          status: "info",
          response_code: null,
          error_message: "Deprecated: use Search Console at https://search.google.com/search-console",
        });
      }

      // For Bing, use IndexNow instead of the deprecated ping endpoint.
      if (shouldBing) {
        const bingResults = await submitIndexNow([`${SITE_URL}/`]);
        for (const r of bingResults) {
          allResults.push({ target: r.target, status: r.status, statusCode: r.statusCode });
          await supabase.from("ping_logs").insert({
            target: r.target,
            sitemap_url: sitemapUrl,
            status: r.status,
            response_code: r.statusCode ?? null,
            error_message: r.status !== "success" ? (r.body?.substring(0, 200) || `HTTP ${r.statusCode}`) : null,
          });
        }
      }

      return NextResponse.json({ success: true, results: allResults });
    }

    // ─── Submit URL list ─────────────────────────────────────────────────────
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ success: false, message: "No URLs provided" }, { status: 400 });
    }

    // Only submit URLs that belong to our domain
    const urlList: string[] = urls
      .map((u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`))
      .filter((u: string) => {
        try { return new URL(u).hostname === HOST; } catch { return false; }
      });

    if (urlList.length === 0) {
      return NextResponse.json({ success: false, message: "No valid URLs for this host" }, { status: 400 });
    }

    const allResults = await submitIndexNow(urlList);

    // Google does not support IndexNow — guide user to Search Console
    allResults.push({
      target: "Google",
      status: "info",
      statusCode: undefined,
      body: "Google does not support IndexNow. Use Google Search Console to request indexing.",
    });

    // Save to DB
    const urlSummary = urlList.slice(0, 3).join(", ") + (urlList.length > 3 ? ` +${urlList.length - 3} more` : "");
    for (const r of allResults) {
      await supabase.from("ping_logs").insert({
        target: r.target,
        sitemap_url: urlSummary,
        status: r.status,
        response_code: r.statusCode ?? null,
        response_body: `${urlList.length} URLs submitted`,
        error_message: r.status !== "success" && r.status !== "info"
          ? (r.body?.substring(0, 200) || `HTTP ${r.statusCode}`)
          : null,
      });
    }

    return NextResponse.json({ success: true, results: allResults, urlCount: urlList.length });
  } catch (error: unknown) {
    console.error("IndexNow error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET: fetch recent ping logs
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
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

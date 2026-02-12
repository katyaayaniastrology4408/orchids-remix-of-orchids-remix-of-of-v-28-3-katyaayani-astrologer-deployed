import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static files, API routes, and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next();
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: redirect } = await supabase
      .from("redirects")
      .select("destination_path, status_code, id, hit_count")
      .eq("source_path", pathname)
      .eq("is_active", true)
      .single();

    if (redirect) {
      // Update hit count in background (non-blocking)
      supabase
        .from("redirects")
        .update({
          hit_count: (redirect.hit_count || 0) + 1,
          last_hit_at: new Date().toISOString(),
        })
        .eq("id", redirect.id)
        .then();

      const destinationUrl = redirect.destination_path.startsWith("http")
        ? redirect.destination_path
        : new URL(redirect.destination_path, req.url).toString();

      return NextResponse.redirect(destinationUrl, redirect.status_code || 301);
    }
  } catch {
    // If redirect check fails, continue normally
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

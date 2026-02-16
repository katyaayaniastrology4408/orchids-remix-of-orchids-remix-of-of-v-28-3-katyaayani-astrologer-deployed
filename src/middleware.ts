import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- Rate Limiting (in-memory, per IP) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_API = 60; // 60 requests/min for API
const RATE_LIMIT_MAX_PAGE = 120; // 120 requests/min for pages

function checkRateLimit(ip: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

// Clean up expired entries inline (every 100th check)
let cleanupCounter = 0;
function maybeCleanup() {
  cleanupCounter++;
  if (cleanupCounter % 100 === 0) {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }
}

// --- Admin API Authentication ---
async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admin-token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) return false;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return false;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return false;

    // Check if user email matches admin
    const adminEmail = process.env.ADMIN_EMAIL;
    return user.email === adminEmail;
  } catch {
    return false;
  }
}

// --- Security Headers ---
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  maybeCleanup();

  // Skip middleware for static files and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api")) {
    if (!checkRateLimit(`api:${ip}`, RATE_LIMIT_MAX_API)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Admin API protection - require auth for admin endpoints
    if (pathname.startsWith("/api/admin")) {
      // Allow health-check without auth (for external monitoring)
      if (pathname === "/api/admin/health-check") {
        return addSecurityHeaders(NextResponse.next());
      }

      const isAdmin = await verifyAdminAuth(req);
      if (!isAdmin) {
        // Fallback: check basic auth header (email:password)
        const basicAuth = req.headers.get("x-admin-key");
        const expectedKey = `${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`;
        if (basicAuth !== expectedKey) {
          // Allow if request comes from same origin (browser admin panel)
          const origin = req.headers.get("origin") || req.headers.get("referer") || "";
          const isLocalRequest = origin.includes("localhost") || origin.includes("katyaayaniastrologer.com");
          if (!isLocalRequest) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
        }
      }
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // --- Rate limiting for pages ---
  if (!checkRateLimit(`page:${ip}`, RATE_LIMIT_MAX_PAGE)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  // --- Redirect handling ---
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return addSecurityHeaders(NextResponse.next());
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

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

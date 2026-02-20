import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

// --- JWT Verification (Edge-compatible) ---
async function verifyAdminJWT(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "katyaayani-admin-jwt-secret-2026-xK9pQmRz7nVwYeHsLdBcFgJtNuAiOv"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
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

  // --- Admin page protection (non-API) ---
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/signin")) {
    const jwtCookie = req.cookies.get("admin-jwt")?.value;
    if (!jwtCookie || !(await verifyAdminJWT(jwtCookie))) {
      const signinUrl = new URL("/admin/signin", req.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api")) {
    if (!checkRateLimit(`api:${ip}`, RATE_LIMIT_MAX_API)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Admin API protection
    if (pathname.startsWith("/api/admin")) {
      // Always allow these without JWT (they are part of the login flow)
      const publicAdminRoutes = [
        "/api/admin/health-check",
        "/api/admin/auth/send-otp",
        "/api/admin/auth/verify-otp",
        "/api/admin/auth/forgot-password",
        "/api/admin/auth/logout",
      ];
      if (!publicAdminRoutes.includes(pathname)) {
        const jwtCookie = req.cookies.get("admin-jwt")?.value;
        const isValid = jwtCookie ? await verifyAdminJWT(jwtCookie) : false;

        if (!isValid) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Dynamically import to avoid Edge runtime issues
    const { createClient } = await import("@supabase/supabase-js");
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

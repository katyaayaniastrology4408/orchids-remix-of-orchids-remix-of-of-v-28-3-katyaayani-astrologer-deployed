import { NextResponse } from "next/server";

// Redirects browser to Google's OAuth consent screen directly
// No supabase.co involved — pure Google OAuth PKCE flow
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured. Please add GOOGLE_CLIENT_ID to environment variables." }, { status: 500 });
  }

  const origin = req.headers.get("origin") || req.headers.get("referer");
  const host = req.headers.get("host") || "www.katyaayaniastrologer.com";
  
  // Dynamic base URL detection
  // Prioritize the current host if we're on localhost to allow testing.
  // Otherwise use NEXT_PUBLIC_APP_URL or detected host.
  const appUrl = host.includes("localhost") 
    ? `http://${host}` 
    : (process.env.NEXT_PUBLIC_APP_URL || `https://${host}`);
  
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Store a random state in the redirect URL for CSRF protection
  const state = Math.random().toString(36).substring(2, 18);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  // Store state in cookie for verification
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}

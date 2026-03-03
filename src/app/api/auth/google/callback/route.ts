import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email.config";
import { welcomeEmailTemplate } from "@/lib/email-templates";
import { syncToSubscribers } from "@/lib/subscribers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

    const host = req.headers.get("host") || "www.katyaayaniastrologer.com";
    
    // Improved local detection including IP addresses (for mobile testing)
    const isLocal = host.includes("localhost") || 
                    host.startsWith("192.168.") || 
                    host.startsWith("10.") || 
                    host.startsWith("172.") || 
                    host.includes("127.0.0.1");
    
    const protocol = isLocal ? "http" : "https";
    const appUrl = isLocal ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || `https://${host}`);

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/signin?error=${encodeURIComponent(error || "Google login cancelled")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/signin?error=${encodeURIComponent("Google OAuth not configured")}`);
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      console.error("Token exchange failed:", tokens);
      return NextResponse.redirect(`${appUrl}/signin?error=${encodeURIComponent("Failed to get Google tokens")}`);
    }

    // Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/signin?error=${encodeURIComponent("Could not get email from Google")}`);
    }

    // Find or create user in Supabase via admin API (uses pooler — no supabase.co)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === googleUser.email);

    let supabaseUserId: string;
    let isNew = false;

    if (existingUser) {
      supabaseUserId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: googleUser.email,
        email_confirm: true,
        user_metadata: {
          full_name: googleUser.name || "",
          avatar_url: googleUser.picture || "",
          provider: "google",
        },
      });
      if (createError || !newUser?.user) {
        console.error("Create user failed:", createError);
        return NextResponse.redirect(`${appUrl}/signin?error=${encodeURIComponent("Failed to create account")}`);
      }
      supabaseUserId = newUser.user.id;
      isNew = true;
    }

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert({
      id: supabaseUserId,
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split("@")[0],
      avatar_url: googleUser.picture || "",
      email_verified: true,
    }, { onConflict: "id" });

    // Sync to newsletter subscribers
    await syncToSubscribers(googleUser.email, googleUser.name || "", "google_signup", false).catch(() => {});

    // Send welcome email for new users
    if (isNew) {
      sendEmail({
        to: googleUser.email,
        subject: "Welcome to Katyaayani Astrologer ✨",
        html: welcomeEmailTemplate(googleUser.name || "Seeker"),
      }).catch(() => {});
    }

    // Create a magic link session for the user so Supabase client picks up the session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: googleUser.email,
      options: {
        redirectTo: `${appUrl}/auth/google-complete?uid=${supabaseUserId}&isNew=${isNew}`
      }
    });

    if (sessionError || !sessionData?.properties?.hashed_token) {
      console.error("Session link error:", sessionError);
      // Fallback: redirect to profile with user info in query
      const response = NextResponse.redirect(`${appUrl}/auth/google-complete?uid=${supabaseUserId}&isNew=${isNew}`);
      return response;
    }

    // Redirect to the magic link to establish session
    const actionLink = sessionData.properties.action_link;
    if (actionLink) {
      // Force the action link to use our appUrl instead of whatever Supabase has configured as Site URL
      const actionUrl = new URL(actionLink);
      const finalActionUrl = `${appUrl}${actionUrl.pathname}${actionUrl.search}`;
      return NextResponse.redirect(finalActionUrl);
    }

    return NextResponse.redirect(`${appUrl}/auth/google-complete?uid=${supabaseUserId}&isNew=${isNew}`);

  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/signin?error=${encodeURIComponent(err.message || "Google login failed")}`);
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email.config";
import { welcomeEmailTemplate } from "@/lib/email-templates";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, email, name, avatar, isNew } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ success: false, error: "Missing user info" }, { status: 400 });
    }

    // Upsert profile in profiles table
    // Check if profile already exists
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .eq("id", id)
      .single();

    if (!existing) {
      // Insert new profile for Google user
      const { error: upsertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id,
          email,
          name: name || email.split("@")[0],
          email_verified: true,
        });
      if (upsertError) console.error("Profile insert error:", upsertError);
    }

    // If new user — send welcome email
    if (isNew && email) {
      try {
        await sendEmail({
          to: email,
          subject: "Welcome to Katyaayani Astrologer ✨",
          html: welcomeEmailTemplate(name || "Seeker"),
        });
      } catch (emailErr) {
        console.error("Welcome email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, isNew });
  } catch (error: any) {
    console.error("Google login handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

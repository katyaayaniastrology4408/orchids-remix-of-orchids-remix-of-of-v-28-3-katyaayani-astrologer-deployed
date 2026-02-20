import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, phone, gender, dob, tob, pob, clear_password } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        phone: phone || null,
        gender: gender || null,
        dob: dob || null,
        tob: tob || null,
        pob: pob || null,
        email_verified: true,
        ...(clear_password ? { clear_password } : {}),
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

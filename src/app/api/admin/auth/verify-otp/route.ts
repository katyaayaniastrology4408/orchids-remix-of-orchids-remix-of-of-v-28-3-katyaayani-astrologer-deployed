import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export const dynamic = 'force-dynamic' ; 

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();

    const { data: storedOtpRecord } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_login_otp')
      .single();

    const { data: storedExpiryRecord } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_login_otp_expiry')
      .single();

    if (!storedOtpRecord || !storedExpiryRecord) {
      return NextResponse.json({ error: "No verification code sent" }, { status: 400 });
    }

    const storedOtp = storedOtpRecord.value;
    const expiry = new Date(storedExpiryRecord.value);

    if (new Date() > expiry) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }

    if (otp !== storedOtp) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Optional: Clear OTP after successful verification
    // await supabase.from('admin_settings').delete().in('key', ['admin_login_otp', 'admin_login_otp_expiry']);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

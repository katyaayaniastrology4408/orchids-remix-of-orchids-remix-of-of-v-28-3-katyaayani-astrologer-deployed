import { NextResponse } from "next/server";
import { sendLoginNotification } from "@/lib/email";
export const dynamic = 'force-dynamic' ; 

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await sendLoginNotification({
      email,
      name: name || "Seeker"
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Login notification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "NOT_SET",
    ADMIN_EMAIL_length: (process.env.ADMIN_EMAIL || "").length,
    ADMIN_PASSWORD_set: !!process.env.ADMIN_PASSWORD,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ received: body });
}

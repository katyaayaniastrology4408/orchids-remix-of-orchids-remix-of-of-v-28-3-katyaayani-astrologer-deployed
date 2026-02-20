import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email.config";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const displayName = name || "Seeker";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Katyaayani Astrologer</title>
</head>
<body style="margin:0;padding:0;font-family:'Georgia','Times New Roman',serif;background-color:#0a0612;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(180deg,#0a0612 0%,#1a0f2e 50%,#0a0612 100%);padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td style="text-align:center;padding-bottom:28px;">
          <img src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/749cf92f-0c06-43d7-b795-4c90a58526eb/logo_withoutname-1770224400752.png"
            alt="Katyaayani" width="60" height="60"
            style="border-radius:50%;border:2px solid #ff6b35;display:inline-block;" />
          <div style="margin-top:10px;">
            <span style="color:#ff6b35;font-size:20px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">KATYAAYANI</span><br/>
            <span style="color:#c9a87c;font-size:11px;letter-spacing:5px;text-transform:uppercase;">ASTROLOGER</span>
          </div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:linear-gradient(145deg,#12081f,#0d0618);border-radius:24px;border:1px solid rgba(255,107,53,0.2);padding:40px 36px;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="font-size:36px;margin-bottom:8px;">🌟</div>
            <h1 style="color:#ffffff;font-size:26px;margin:0 0 8px;letter-spacing:1px;">Welcome, ${displayName}!</h1>
            <p style="color:#c9a87c;font-size:14px;margin:0;">Your Google account has been linked successfully.</p>
          </div>

          <div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.25);border-radius:16px;padding:24px;margin-bottom:24px;">
            <p style="color:#ff6b35;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Your Login Credentials</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <span style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">
                  <span style="color:#ffffff;font-size:14px;font-weight:600;">${email}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Password</span>
                </td>
                <td style="padding:8px 0;text-align:right;">
                  <span style="color:#ffffff;font-size:14px;font-weight:600;font-family:monospace;background:rgba(255,255,255,0.05);padding:4px 10px;border-radius:6px;">${password}</span>
                </td>
              </tr>
            </table>
            <p style="color:#9ca3af;font-size:11px;margin:14px 0 0;text-align:center;">Save these credentials — you can use them to log in anytime.</p>
          </div>

          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://www.katyaayaniastrologer.com/profile"
              style="display:inline-block;background:linear-gradient(135deg,#ff6b35,#ff8c5e);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;letter-spacing:1px;">
              Go to My Dashboard →
            </a>
          </div>

          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;text-align:center;">
            <p style="color:#6b7280;font-size:11px;margin:0;line-height:1.6;">
              You can also sign in anytime using Google or with your email + password above.<br/>
              <a href="https://www.katyaayaniastrologer.com" style="color:#ff6b35;text-decoration:none;">www.katyaayaniastrologer.com</a>
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding-top:24px;">
          <p style="color:#4b5563;font-size:11px;margin:0;">© ${new Date().getFullYear()} Katyaayani Astrologer. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendEmail({
      to: email,
      subject: "Welcome to Katyaayani Astrologer ✨ — Your Login Details",
      html,
    });

    // Also send to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `New Google Signup: ${displayName} (${email})`,
      html: `<p>New user signed up via Google:</p><ul><li><b>Name:</b> ${displayName}</li><li><b>Email:</b> ${email}</li><li><b>Password set:</b> ${password}</li></ul>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Google welcome email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { dailyRashifalEmailTemplate } from '@/lib/email-templates';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = 'https://www.katyaayaniastrologer.com';

function buildRashifalHtml(name: string, formattedDate: string, rashifalData: any[]): string {
  const RASHI_EMOJI: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
  };
  const rashiRows = rashifalData.map(r => {
    const emoji = RASHI_EMOJI[r.rashi] || '⭐';
    const rName = r.rashi_gujarati ? `${r.rashi.charAt(0).toUpperCase() + r.rashi.slice(1)} (${r.rashi_gujarati})` : r.rashi.charAt(0).toUpperCase() + r.rashi.slice(1);
    const text = (r.content_english || r.content_gujarati || '').substring(0, 150).trim();
    const lucky = [r.lucky_number ? `Lucky: ${r.lucky_number}` : '', r.lucky_color ? `Color: ${r.lucky_color}` : ''].filter(Boolean).join(' | ');
    return `<tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;vertical-align:top;font-size:22px;">${emoji}</td>
        <td style="vertical-align:top;">
          <p style="color:#ffd700;font-size:14px;font-weight:700;margin:0 0 5px;">${rName}</p>
          <p style="color:#e8d5b7;font-size:13px;line-height:1.6;margin:0;">${text}${text.length >= 150 ? '...' : ''}</p>
          ${lucky ? `<p style="color:#ffb347;font-size:11px;margin:6px 0 0;font-style:italic;">${lucky}</p>` : ''}
        </td>
      </tr></table>
    </td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#22100a;border-radius:16px;overflow:hidden;border:1px solid #8b3a0f;">
        <tr><td style="background:linear-gradient(135deg,#8b1a00,#c45200);padding:32px 24px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🔯</div>
          <h1 style="margin:0;color:#ffd700;font-size:26px;letter-spacing:2px;">Katyaayani Astrologer</h1>
          <p style="margin:8px 0 0;color:#ffb347;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Daily Rashifal</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;text-align:center;">
          <p style="color:#ffd700;font-size:18px;margin:0;">Namaste ${name} 🙏</p>
          <p style="color:#d4a574;font-size:14px;margin:10px 0 0;">Today's cosmic guidance — <strong style="color:#ffb347;">${formattedDate}</strong></p>
          <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#2d1208;border:1px solid #8b3a0f;border-radius:12px;overflow:hidden;">
            ${rashiRows}
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${BASE_URL}/rashifal" style="display:inline-block;background:linear-gradient(135deg,#c45200,#ff6b35);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">See Full Rashifal</a>
        </td></tr>
        <tr><td style="background:#0d0600;padding:20px 32px;text-align:center;border-top:1px solid #8b3a0f;">
          <p style="color:#8b5e3c;font-size:11px;margin:0;">Katyaayani Astrologer | <a href="${BASE_URL}" style="color:#8b5e3c;text-decoration:none;">katyaayaniastrologer.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const { data: rashifalData, error: rashifalError } = await supabase
      .from('daily_rashifal')
      .select('*')
      .eq('date', date);

    if (rashifalError) throw rashifalError;
    if (!rashifalData || rashifalData.length === 0) {
      return NextResponse.json({ error: 'No rashifal data found for this date. Please save rashifal first.' }, { status: 400 });
    }

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('email, name')
      .not('email', 'is', null);

    const validUsers = (allUsers || []).filter(u => u.email && u.email.includes('@'));
    if (validUsers.length === 0) {
      return NextResponse.json({ error: 'No users found to send emails to' }, { status: 400 });
    }

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const BATCH_SIZE = 50;
    let totalSent = 0;

    for (let i = 0; i < validUsers.length; i += BATCH_SIZE) {
      const batch = validUsers.slice(i, i + BATCH_SIZE);
      const emails = batch.map((user) => ({
        from: 'Katyaayani Astrologer <newsletter@katyaayaniastrologer.com>',
        to: user.email,
        subject: `Today's Rashifal — ${formattedDate}`,
        html: buildRashifalHtml(user.name || 'Seeker', formattedDate, rashifalData),
      }));
      try {
        await resend.batch.send(emails);
        totalSent += batch.length;
      } catch (err) {
        console.error('Batch rashifal email error:', err);
      }
      if (i + BATCH_SIZE < validUsers.length) await new Promise(r => setTimeout(r, 500));
    }

    return NextResponse.json({ success: true, totalUsers: validUsers.length, sent: totalSent });
  } catch (error) {
    console.error('Error sending daily rashifal emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

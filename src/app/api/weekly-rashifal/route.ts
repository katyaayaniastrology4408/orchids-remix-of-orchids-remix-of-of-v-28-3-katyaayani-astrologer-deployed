import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://katyaayaniastrologer.com';

const RASHI_DATA = [
  { english: 'aries', gujarati: 'મેષ', hindi: 'मेष' },
  { english: 'taurus', gujarati: 'વૃષભ', hindi: 'वृषभ' },
  { english: 'gemini', gujarati: 'મિથુન', hindi: 'मिथुन' },
  { english: 'cancer', gujarati: 'કર્ક', hindi: 'कर्क' },
  { english: 'leo', gujarati: 'સિંહ', hindi: 'सिंह' },
  { english: 'virgo', gujarati: 'કન્યા', hindi: 'कन्या' },
  { english: 'libra', gujarati: 'તુલા', hindi: 'तुला' },
  { english: 'scorpio', gujarati: 'વૃશ્ચિક', hindi: 'वृश्चिक' },
  { english: 'sagittarius', gujarati: 'ધન', hindi: 'धनु' },
  { english: 'capricorn', gujarati: 'મકર', hindi: 'मकर' },
  { english: 'aquarius', gujarati: 'કુંભ', hindi: 'कुंभ' },
  { english: 'pisces', gujarati: 'મીન', hindi: 'मीन' },
];

// GET weekly rashifal
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rashi = searchParams.get('rashi');
  const weekStart = searchParams.get('week_start');

  try {
    if (rashi && weekStart) {
      const { data, error } = await supabase
        .from('weekly_rashifal')
        .select('*')
        .eq('week_start', weekStart)
        .eq('rashi', rashi.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return NextResponse.json({ success: true, data });
    } else if (weekStart) {
      const { data, error } = await supabase
        .from('weekly_rashifal')
        .select('*')
        .eq('week_start', weekStart)
        .order('rashi');

      if (error) throw error;
      return NextResponse.json({ success: true, data, rashiList: RASHI_DATA });
    } else {
      // Get current week's data (Monday of current week)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const currentWeekStart = monday.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rashifal')
        .select('*')
        .eq('week_start', currentWeekStart)
        .order('rashi');

      if (error) throw error;
      return NextResponse.json({ success: true, data, rashiList: RASHI_DATA, currentWeekStart });
    }
  } catch (error) {
    console.error('Error fetching weekly rashifal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly rashifal' },
      { status: 500 }
    );
  }
}

// POST create/update weekly rashifal (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { week_start, week_end, rashifals } = body;

    if (!week_start || !week_end || !rashifals || !Array.isArray(rashifals)) {
      return NextResponse.json(
        { error: 'week_start, week_end, and rashifals array required' },
        { status: 400 }
      );
    }

    const upsertData = rashifals.map((r: any) => {
      const rashiInfo = RASHI_DATA.find(rd => rd.english === r.rashi.toLowerCase());
      return {
        week_start,
        week_end,
        rashi: r.rashi.toLowerCase(),
        rashi_gujarati: rashiInfo?.gujarati || '',
        rashi_hindi: rashiInfo?.hindi || '',
        content_english: r.content_english,
        content_gujarati: r.content_gujarati || '',
        content_hindi: r.content_hindi || '',
        lucky_number: r.lucky_number || '',
        lucky_color: r.lucky_color || '',
        lucky_color_gujarati: r.lucky_color_gujarati || '',
        lucky_color_hindi: r.lucky_color_hindi || '',
        overall_rating: r.overall_rating || 3,
        love_rating: r.love_rating || 3,
        career_rating: r.career_rating || 3,
        health_rating: r.health_rating || 3,
      };
    });

    const { data, error } = await supabase
      .from('weekly_rashifal')
      .upsert(upsertData, { onConflict: 'week_start,rashi' })
      .select();

    if (error) throw error;

    // Send email to ALL users
    let emailResult = null;
    const { data: existingNotif } = await supabase
      .from('weekly_rashifal_notifications')
      .select('id')
      .eq('week_start', week_start)
      .maybeSingle();

    if (!existingNotif) {
      try {
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('email, name')
          .not('email', 'is', null);

        const validUsers = (allUsers || []).filter(u => u.email && u.email.includes('@'));

        if (validUsers.length > 0) {
          const formattedStart = new Date(week_start + 'T00:00:00').toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          const formattedEnd = new Date(week_end + 'T00:00:00').toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          });

          let sentCount = 0;
          for (const user of validUsers) {
            try {
              const userName = user.name || 'Valued Seeker';
              await sendEmail({
                to: user.email,
                subject: `Weekly Rashifal Updated! (${formattedStart} - ${formattedEnd})`,
                html: getWeeklyRashifalEmailHtml(userName, formattedStart, formattedEnd, upsertData),
              });
              sentCount++;
            } catch (err) {
              console.error(`Failed to send to ${user.email}:`, err);
            }
          }

          await supabase.from('weekly_rashifal_notifications').insert({
            week_start,
            total_users: sentCount,
            status: 'sent'
          });

          emailResult = { sent: true, totalUsers: sentCount };
        } else {
          emailResult = { sent: false, reason: 'No users to notify' };
        }
      } catch (err) {
        console.error('Error sending weekly rashifal notifications:', err);
        emailResult = { sent: false, reason: 'Email sending failed' };
      }
    } else {
      emailResult = { skipped: true, reason: 'Notification already sent for this week' };
    }

    return NextResponse.json({ success: true, data, emailResult });
  } catch (error) {
    console.error('Error saving weekly rashifal:', error);
    return NextResponse.json(
      { error: 'Failed to save weekly rashifal' },
      { status: 500 }
    );
  }
}

function getWeeklyRashifalEmailHtml(userName: string, startDate: string, endDate: string, rashifals: any[] = []) {
  const RASHI_EMOJI: Record<string, string> = {
    aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
    leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
    sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
  };

  const rashiPreviewRows = rashifals.map(r => {
    const emoji = RASHI_EMOJI[r.rashi] || '';
    const name = r.rashi_gujarati ? `${r.rashi.charAt(0).toUpperCase() + r.rashi.slice(1)} (${r.rashi_gujarati})` : r.rashi.charAt(0).toUpperCase() + r.rashi.slice(1);
    const rawContent = r.content_english || r.content_gujarati || '';
    const fullContent = rawContent.length > 120 ? rawContent.substring(0, 120).trim() + '...' : rawContent;
    const luckyInfo = [
      r.lucky_number ? `Lucky Number: ${r.lucky_number}` : '',
      r.lucky_color ? `Lucky Color: ${r.lucky_color}` : '',
    ].filter(Boolean).join(' | ');
    return `
<tr>
  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="width:40px;vertical-align:top;">
          <span style="font-size:24px;">${emoji}</span>
        </td>
        <td style="vertical-align:top;">
          <p style="color:#ff6b35;font-size:15px;font-weight:700;margin:0 0 6px;">${name}</p>
          <p style="color:#e8dcc8;font-size:13px;line-height:1.6;margin:0;">${fullContent}</p>
          ${luckyInfo ? `<p style="color:#c9a87c;font-size:12px;margin:8px 0 0;font-style:italic;">${luckyInfo}</p>` : ''}
          <a href="${BASE_URL}/rashifal?tab=weekly" style="color:#ff6b35;font-size:12px;text-decoration:none;font-weight:600;display:inline-block;margin-top:8px;">See More &rarr;</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Georgia','Times New Roman',serif;background-color:#0a0612;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(180deg,#0a0612 0%,#1a0f2e 50%,#0a0612 100%);padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td style="text-align:center;padding-bottom:30px;">
<span style="color:#ff6b35;font-size:20px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">KATYAAYANI</span><br>
<span style="color:#c9a87c;font-size:11px;letter-spacing:5px;text-transform:uppercase;">ASTROLOGER</span>
</td></tr>
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(145deg,#12081f 0%,#0d0618 100%);border-radius:24px;border:1px solid rgba(255,107,53,0.2);">
<tr><td style="padding:40px 35px 20px;text-align:center;">
<span style="display:inline-block;padding:8px 20px;background:rgba(255,107,53,0.15);border-radius:30px;color:#ff6b35;font-size:12px;letter-spacing:2px;text-transform:uppercase;border:1px solid rgba(255,107,53,0.3);">
Weekly Rashifal Updated
</span>
<h1 style="color:#ffffff;font-size:28px;font-weight:600;margin:20px 0 0;">This Week's Horoscope is Ready!</h1>
</td></tr>
<tr><td style="padding:20px 35px;">
<p style="color:#e8dcc8;font-size:16px;margin-bottom:15px;">Namaste <strong style="color:#ff6b35;">${userName}</strong>,</p>
<p style="color:#b8a896;font-size:15px;line-height:1.7;">
The weekly rashifal for <strong style="color:#ff6b35;">${startDate} - ${endDate}</strong> has been uploaded. Here's a preview of each sign:
</p>
</td></tr>
${rashifals.length > 0 ? `
<tr><td style="padding:0 35px 20px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,107,53,0.1);">
${rashiPreviewRows}
</table>
</td></tr>
` : ''}
<tr><td style="padding:25px 35px 40px;text-align:center;">
<a href="${BASE_URL}/rashifal?tab=weekly" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#ff6b35 0%,#ff8c5a 100%);color:#ffffff;text-decoration:none;border-radius:30px;font-weight:600;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
View Weekly Rashifal
</a>
</td></tr>
</table>
</td></tr>
<tr><td style="padding-top:35px;text-align:center;">
<p style="color:#c9a87c;font-style:italic;font-size:14px;">"The stars impel, they do not compel."</p>
<p style="color:#666;font-size:11px;margin-top:15px;">&copy; ${new Date().getFullYear()} Katyaayani Astrologer. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

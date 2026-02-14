import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
import { weeklyRashifalEmailTemplate } from '@/lib/email-templates';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { week_start, week_end, rashifals, sendNotification } = body;

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

    if (sendNotification) {
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
                html: weeklyRashifalEmailTemplate(userName, formattedStart, formattedEnd, upsertData),
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
    } // end sendNotification check

    return NextResponse.json({ success: true, data, emailResult });
  } catch (error) {
    console.error('Error saving weekly rashifal:', error);
    return NextResponse.json(
      { error: 'Failed to save weekly rashifal' },
      { status: 500 }
    );
  }
}

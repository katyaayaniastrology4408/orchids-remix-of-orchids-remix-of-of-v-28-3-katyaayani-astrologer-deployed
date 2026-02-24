import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { weeklyRashifalEmailTemplate } from '@/lib/email-templates';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { week_start, week_end } = await request.json();
    if (!week_start || !week_end) {
      return NextResponse.json({ error: 'week_start and week_end are required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    // Get all weekly rashifal data
    const { data: rashifalData, error: rashifalError } = await supabase
      .from('weekly_rashifal')
      .select('*')
      .eq('week_start', week_start);

    if (rashifalError) throw rashifalError;
    if (!rashifalData || rashifalData.length === 0) {
      return NextResponse.json({ error: 'No weekly rashifal data found. Please save rashifal first.' }, { status: 400 });
    }

    // Get all users
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('email, name')
      .not('email', 'is', null);

    const validUsers = (allUsers || []).filter(u => u.email && u.email.includes('@'));
    if (validUsers.length === 0) {
      return NextResponse.json({ error: 'No users found to send emails to' }, { status: 400 });
    }

    const formattedStart = new Date(week_start + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const formattedEnd = new Date(week_end + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const resend = new Resend(resendApiKey);
    const FROM = process.env.RESEND_FROM_EMAIL || 'Katyaayani Astrologer <noreply@katyaayaniastrologer.com>';
    const subject = `Weekly Rashifal Updated! (${formattedStart} - ${formattedEnd})`;

    let sentCount = 0;

    // Send in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < validUsers.length; i += BATCH_SIZE) {
      const batch = validUsers.slice(i, i + BATCH_SIZE);
      const emails = batch.map((user) => ({
        from: FROM,
        to: user.email,
        subject,
        html: weeklyRashifalEmailTemplate(user.name || 'Valued Seeker', formattedStart, formattedEnd, rashifalData),
      }));

      try {
        const { data: batchData, error: batchError } = await resend.batch.send(emails);
        if (!batchError) {
          sentCount += batch.length;
        } else {
          console.error('Batch error:', batchError);
        }
      } catch (err) {
        console.error('Batch send failed:', err);
      }

      if (i + BATCH_SIZE < validUsers.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return NextResponse.json({ success: true, totalUsers: sentCount });
  } catch (error) {
    console.error('Error sending weekly rashifal emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

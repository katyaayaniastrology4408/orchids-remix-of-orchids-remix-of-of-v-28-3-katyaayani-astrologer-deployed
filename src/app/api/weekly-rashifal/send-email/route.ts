import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
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

    let sentCount = 0;
    for (const user of validUsers) {
      try {
        const userName = user.name || 'Valued Seeker';
        await sendEmail({
          to: user.email,
          subject: `Weekly Rashifal Updated! (${formattedStart} - ${formattedEnd})`,
          html: weeklyRashifalEmailTemplate(userName, formattedStart, formattedEnd, rashifalData),
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err);
      }
    }

    return NextResponse.json({ success: true, totalUsers: sentCount });
  } catch (error) {
    console.error('Error sending weekly rashifal emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

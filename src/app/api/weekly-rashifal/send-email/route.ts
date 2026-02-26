import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
import { weeklyRashifalEmailTemplate } from '@/lib/email-templates';
import { getUnifiedSubscribers } from '@/lib/subscribers';
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

    // Get all users from unified subscriber list
    const validUsers = await getUnifiedSubscribers();
    
    if (validUsers.length === 0) {
      return NextResponse.json({ error: 'No users found to send emails to' }, { status: 400 });
    }

    const formattedStart = new Date(week_start + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const formattedEnd = new Date(week_end + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const subject = `Weekly Rashifal Updated! (${formattedStart} - ${formattedEnd})`;

    let sentCount = 0;
    const errors: string[] = [];

    // Send to all users via SMTP (sequential with small delay to avoid rate limits)
    for (const user of validUsers) {
      try {
        const result = await sendEmail({
          to: user.email,
          subject,
          html: weeklyRashifalEmailTemplate(user.name || 'Valued Seeker', formattedStart, formattedEnd, rashifalData),
        });
        if (result.success) {
          sentCount++;
        } else {
          errors.push(`${user.email}: ${result.error}`);
        }
      } catch (err: any) {
        errors.push(`${user.email}: ${err.message}`);
      }
      // Small delay
      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({ success: true, totalUsers: sentCount, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Error sending weekly rashifal emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

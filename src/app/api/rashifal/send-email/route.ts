import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
import { dailyRashifalEmailTemplate } from '@/lib/email-templates';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Get all rashifal data for this date
    const { data: rashifalData, error: rashifalError } = await supabase
      .from('daily_rashifal')
      .select('*')
      .eq('date', date);

    if (rashifalError) throw rashifalError;
    if (!rashifalData || rashifalData.length === 0) {
      return NextResponse.json({ error: 'No rashifal data found for this date. Please save rashifal first.' }, { status: 400 });
    }

    // Get all users from profiles and newsletter_subscribers
    const [profilesRes, subscribersRes] = await Promise.all([
      supabase.from('profiles').select('email, name').not('email', 'is', null),
      supabase.from('newsletter_subscribers').select('email, first_name, last_name').eq('is_active', true)
    ]);

    const userMap = new Map<string, string>();
    
    profilesRes.data?.forEach(u => {
      if (u.email) {
        userMap.set(u.email.toLowerCase(), u.name || 'Valued Seeker');
      }
    });
    
    subscribersRes.data?.forEach(u => {
      if (u.email) {
        const email = u.email.toLowerCase();
        if (!userMap.has(email)) {
          const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Valued Seeker';
          userMap.set(email, name);
        }
      }
    });

    const validUsers = Array.from(userMap.entries()).map(([email, name]) => ({ email, name }));
    
    if (validUsers.length === 0) {
      return NextResponse.json({ error: 'No users found to send emails to' }, { status: 400 });
    }

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let sentCount = 0;
    const errors: string[] = [];

    // Send to all users via Gmail SMTP (sequential with small delay)
    for (const user of validUsers) {
      try {
        const userName = user.name || 'Valued Seeker';
        const result = await sendEmail({
          to: user.email,
          subject: `Today's Rashifal Has Been Updated! - ${formattedDate}`,
          html: dailyRashifalEmailTemplate(userName, formattedDate, rashifalData),
        });
        if (result.success) {
          sentCount++;
        } else {
          errors.push(`${user.email}: ${result.error}`);
        }
      } catch (err: any) {
        errors.push(`${user.email}: ${err.message}`);
      }
      // Small delay between sends to avoid Gmail rate limiting
      await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({ success: true, totalUsers: sentCount, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Error sending daily rashifal emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

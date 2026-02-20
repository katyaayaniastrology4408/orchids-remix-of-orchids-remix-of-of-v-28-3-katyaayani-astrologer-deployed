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

    // Get all users
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

      // Send to one random user only
      const randomUser = validUsers[Math.floor(Math.random() * validUsers.length)];
      const userName = randomUser.name || 'Valued Seeker';
      await sendEmail({
        to: randomUser.email,
        subject: `Today's Rashifal Has Been Updated! - ${formattedDate}`,
        html: dailyRashifalEmailTemplate(userName, formattedDate, rashifalData),
      });

      return NextResponse.json({ success: true, totalUsers: 1, sentTo: randomUser.email });
  } catch (error) {
    console.error('Error sending daily rashifal emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

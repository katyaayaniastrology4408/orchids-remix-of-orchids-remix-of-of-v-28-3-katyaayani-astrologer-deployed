import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmailViaSMTP } from '@/lib/nodemailer';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { subject, html, secretKey } = await request.json();

    // Simple auth check
    if (secretKey !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and html are required' }, { status: 400 });
    }

    // Get all active subscribers
    const { data: subscribers, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Send one by one with small delay to avoid Gmail rate limits
    for (const sub of subscribers || []) {
      try {
        const result = await sendEmailViaSMTP({
          to: sub.email,
          subject,
          html,
        });
        results.push({ email: sub.email, success: result.success, error: result.error });
        // 1 second delay between emails
        await new Promise(r => setTimeout(r, 1000));
      } catch (err: any) {
        results.push({ email: sub.email, success: false, error: err.message });
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: results.length,
      sent,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

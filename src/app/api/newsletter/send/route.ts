import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic';

const RESEND_AUDIENCE_ID = 'e6bafd8b-5149-4862-a298-e23bd5578190';

export async function POST(request: NextRequest) {
  try {
    const { subject, html, secretKey } = await request.json();

    if (secretKey !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and html are required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    // Get all active subscribers from Supabase
    const { data: subscribers, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, total: 0, sent: 0, failed: 0, results: [] });
    }

    const resend = new Resend(resendApiKey);
    const results: { email: string; success: boolean; error?: string }[] = [];

    // Resend allows batch — send in batches of 100 (daily limit is 100)
    const BATCH_SIZE = 50;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const emails = batch.map(sub => ({
        from: 'Katyaayani Astrologer <newsletter@katyaayaniastrologer.com>',
        to: sub.email,
        subject,
        html,
      }));

      try {
        const { data: batchData, error: batchError } = await resend.batch.send(emails);
        if (batchError) {
          batch.forEach(sub => results.push({ email: sub.email, success: false, error: String(batchError) }));
        } else {
          batch.forEach(sub => results.push({ email: sub.email, success: true }));
        }
      } catch (err: any) {
        batch.forEach(sub => results.push({ email: sub.email, success: false, error: err.message }));
      }

      // Small delay between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(r => setTimeout(r, 500));
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

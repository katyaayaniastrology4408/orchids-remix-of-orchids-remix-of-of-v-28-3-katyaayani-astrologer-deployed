import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { verifyAdminJWT } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

const RESEND_AUDIENCE_ID = 'e6bafd8b-5149-4862-a298-e23bd5578190';

export async function POST(request: NextRequest) {
  try {
    // Require valid admin JWT cookie
    const token = request.cookies.get("admin-jwt")?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyAdminJWT(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, html, templateName, variables } = body;

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    // Get all active subscribers
    const { data: subscribers, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, first_name, last_name')
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, total: 0, sent: 0, failed: 0, results: [] });
    }

    const resend = new Resend(resendApiKey);
    const results: { email: string; success: boolean; error?: string }[] = [];

    // If templateName provided, fetch the Resend template and replace variables in HTML
    let emailHtml = html || '';
    if (templateName && !html) {
      // Fetch templates list to get the template
      const tmplRes = await fetch('https://api.resend.com/templates', {
        headers: { Authorization: `Bearer ${resendApiKey}` },
      });
      const tmplData = await tmplRes.json();
      const found = (tmplData.data || []).find((t: any) => t.name === templateName);
      if (!found) {
        return NextResponse.json({ error: `Template "${templateName}" not found on Resend. Please run Setup Templates first.` }, { status: 400 });
      }
      emailHtml = found.html || '';
    }

    if (!emailHtml) {
      return NextResponse.json({ error: 'No email content (html or templateName) provided.' }, { status: 400 });
    }

    // Send in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const emails = batch.map((sub) => {
        // Replace template variables — merge global vars with per-subscriber NAME
        const vars: Record<string, string> = {
          UNSUBSCRIBE_URL: 'https://www.katyaayaniastrologer.com/unsubscribe',
          ...variables,
          NAME: sub.first_name || variables?.NAME || 'Devotee',
        };
        // Replace {{{VAR}}} patterns
        let finalHtml = emailHtml;
        for (const [key, val] of Object.entries(vars)) {
          finalHtml = finalHtml.split(`{{{${key}}}}`).join(String(val));
        }
        return {
          from: process.env.RESEND_FROM_EMAIL || 'Katyaayani Astrologer <noreply@katyaayaniastrologer.com>',
          to: sub.email,
          subject,
          html: finalHtml,
        };
      });

      try {
        const { data: batchData, error: batchError } = await resend.batch.send(emails);
        if (batchError) {
          batch.forEach((sub) => results.push({ email: sub.email, success: false, error: String(batchError) }));
        } else {
          batch.forEach((sub) => results.push({ email: sub.email, success: true }));
        }
      } catch (err: any) {
        batch.forEach((sub) => results.push({ email: sub.email, success: false, error: err.message }));
      }

      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({ success: true, total: results.length, sent, failed, results });
  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

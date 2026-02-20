import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { templateId, sendTo, testEmail, variables } = await req.json();

    if (!templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 });

    // Fetch template
    const { data: tmpl, error: tmplErr } = await supabaseAdmin
      .from('custom_email_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    if (tmplErr || !tmpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });

    const resend = new Resend(resendApiKey);
    const from = process.env.RESEND_FROM_EMAIL || 'Katyaayani Astrologer <noreply@katyaayaniastrologer.com>';

    function applyVars(html: string, vars: Record<string, string>) {
      let out = html;
      for (const [key, val] of Object.entries(vars)) {
        out = out.split(`{{{${key}}}}`).join(String(val));
      }
      return out;
    }

    // --- Test email ---
    if (sendTo === 'test') {
      if (!testEmail?.trim()) return NextResponse.json({ error: 'testEmail is required for test send' }, { status: 400 });
      const vars = {
        UNSUBSCRIBE_URL: 'https://www.katyaayaniastrologer.com/unsubscribe',
        NAME: 'Test User',
        ...variables,
      };
      const html = applyVars(tmpl.html, vars);
      const { error } = await resend.emails.send({ from, to: testEmail.trim(), subject: `[TEST] ${tmpl.subject}`, html });
      if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
      return NextResponse.json({ success: true, sent: 1, failed: 0 });
    }

    // --- Send to all active subscribers ---
    const { data: subscribers, error: subErr } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, first_name')
      .eq('is_active', true);
    if (subErr) return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, total: 0 });
    }

    const results: { email: string; success: boolean; error?: string }[] = [];
    const BATCH = 50;

    for (let i = 0; i < subscribers.length; i += BATCH) {
      const batch = subscribers.slice(i, i + BATCH);
      const emails = batch.map((sub) => {
        const vars = {
          UNSUBSCRIBE_URL: 'https://www.katyaayaniastrologer.com/unsubscribe',
          NAME: sub.first_name || 'Devotee',
          ...variables,
        };
        return { from, to: sub.email, subject: tmpl.subject, html: applyVars(tmpl.html, vars) };
      });
      try {
        const { error: batchErr } = await resend.batch.send(emails);
        if (batchErr) {
          batch.forEach((s) => results.push({ email: s.email, success: false, error: String(batchErr) }));
        } else {
          batch.forEach((s) => results.push({ email: s.email, success: true }));
        }
      } catch (err: any) {
        batch.forEach((s) => results.push({ email: s.email, success: false, error: err.message }));
      }
      if (i + BATCH < subscribers.length) await new Promise((r) => setTimeout(r, 500));
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return NextResponse.json({ success: true, total: results.length, sent, failed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

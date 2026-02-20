import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic';

const RESEND_AUDIENCE_ID = 'e6bafd8b-5149-4862-a298-e23bd5578190';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { error: dbError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          is_active: true,
        },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('Supabase newsletter error:', dbError);
    }

    // Save contact to Resend audience
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.contacts.create({
          audienceId: RESEND_AUDIENCE_ID,
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          unsubscribed: false,
        });
      } catch (resendError) {
        console.error('Resend contact add error:', resendError);
        // Don't fail — Supabase save already done
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

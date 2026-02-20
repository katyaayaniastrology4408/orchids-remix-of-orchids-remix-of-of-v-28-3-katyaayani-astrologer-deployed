import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic';

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
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (resendApiKey && audienceId) {
      try {
        const resend = new Resend(resendApiKey);
        const { data, error: resendError } = await resend.contacts.create({
          audienceId,
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          unsubscribed: false,
        });
        if (resendError) {
          console.error('Resend contact create error:', resendError);
        } else {
          console.log('Contact added to Resend audience:', audienceId, email, data);
        }
      } catch (resendError) {
        console.error('Resend contact add exception:', resendError);
      }
    } else {
      console.warn('RESEND_API_KEY or RESEND_AUDIENCE_ID missing');
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

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic';

// Will be resolved at runtime from env or created if not exists
let cachedAudienceId: string | null = process.env.RESEND_AUDIENCE_ID || null;

async function getOrCreateAudienceId(resend: Resend): Promise<string | null> {
  if (cachedAudienceId) return cachedAudienceId;
  try {
    // List existing audiences
    const listResult = await resend.audiences.list();
    const audienceList: any[] = (listResult?.data as any)?.data ?? listResult?.data ?? [];
    if (audienceList.length > 0) {
      cachedAudienceId = audienceList[0].id;
      console.log('Using existing Resend audience:', cachedAudienceId);
      return cachedAudienceId;
    }
    // Create a new audience
    const createResult = await resend.audiences.create({
      name: 'Katyaayani Astrologer Newsletter',
    });
    const newAudience: any = createResult?.data;
    if (newAudience?.id) {
      cachedAudienceId = newAudience.id;
      console.log('Created new Resend audience:', cachedAudienceId);
      return cachedAudienceId;
    }
    console.error('Could not get/create Resend audience:', createResult?.error);
    return null;
  } catch (e) {
    console.error('Error resolving Resend audience:', e);
    return null;
  }
}

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
          const audienceId = await getOrCreateAudienceId(resend);
          if (audienceId) {
            const { error: resendContactError } = await resend.contacts.create({
              audienceId,
              email,
              firstName: firstName || undefined,
              lastName: lastName || undefined,
              unsubscribed: false,
            });
            if (resendContactError) {
              console.error('Resend contact create error:', resendContactError);
            } else {
              console.log('Contact added to Resend audience:', audienceId, email);
            }
          }
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

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic' ; 

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

    // Try Brevo if API key is configured
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey && brevoApiKey !== 'YOUR_BREVO_API_KEY') {
      try {
        const { addContactToList } = await import('@/lib/brevo');
        await addContactToList({
          email,
          firstName,
          lastName,
          listIds: [2],
        });
      } catch (brevoError) {
        console.error('Brevo newsletter error:', brevoError);
        // Don't fail if Brevo fails - we still saved to Supabase
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

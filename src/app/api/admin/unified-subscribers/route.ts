import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUnifiedSubscribers } from '@/lib/subscribers';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const unifiedList = await getUnifiedSubscribers();
    
    // For the UI, we might need more details (source, date, etc.)
    // But the basic list is what matters most for sending.
    // Let's fetch the full data for the UI.
    const [profilesRes, subscribersRes] = await Promise.all([
      supabase.from('profiles').select('email, name, created_at').not('email', 'is', null),
      supabase.from('newsletter_subscribers').select('email, first_name, last_name, subscribed_at, source, is_active, is_newsletter_subscriber')
    ]);

    const userMap = new Map<string, any>();
    
    profilesRes.data?.forEach(u => {
      if (u.email) {
        const email = u.email.toLowerCase();
        userMap.set(email, {
          email,
          name: u.name || 'Valued Seeker',
          source: 'profile',
          date: u.created_at,
          isActive: true,
          isNewsletterSub: false // Default for profiles unless also in newsletter table
        });
      }
    });
    
    subscribersRes.data?.forEach(u => {
      if (u.email) {
        const email = u.email.toLowerCase();
        if (userMap.has(email)) {
          // Merge info, prioritize newsletter source if already in profiles
          const existing = userMap.get(email);
          userMap.set(email, {
            ...existing,
            isNewsletterSub: u.is_newsletter_subscriber,
            newsletterSource: u.source,
            isActive: u.is_active
          });
        } else {
          const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Valued Seeker';
          userMap.set(email, {
            email,
            name,
            source: u.source || 'newsletter',
            date: u.subscribed_at,
            isActive: u.is_active,
            isNewsletterSub: u.is_newsletter_subscriber
          });
        }
      }
    });

    const unifiedResult = Array.from(userMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ 
      success: true, 
      count: unifiedResult.length,
      data: unifiedResult,
      stats: {
        total: unifiedResult.length,
        profiles: profilesRes.data?.length || 0,
        newsletterOnly: unifiedResult.filter(u => u.isNewsletterSub && u.source !== 'profile').length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST to sync all profiles to newsletter table
export async function POST(request: NextRequest) {
  try {
    const { data: profiles } = await supabase.from('profiles').select('email, name').not('email', 'is', null);
    
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, synced: 0 });
    }

    const syncData = profiles.map(p => ({
      email: p.email.toLowerCase(),
      first_name: p.name || null,
      source: 'profile_sync',
      is_active: true,
      is_newsletter_subscriber: false // Syncing profiles doesn't mean they opted into the newsletter
    }));

    const { error, data } = await supabase
      .from('newsletter_subscribers')
      .upsert(syncData, { onConflict: 'email' });

    if (error) throw error;

    return NextResponse.json({ success: true, synced: syncData.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

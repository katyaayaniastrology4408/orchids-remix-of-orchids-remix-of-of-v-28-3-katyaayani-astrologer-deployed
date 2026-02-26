import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Subscriber {
  email: string;
  name: string;
}

/**
 * Fetches a unified list of unique subscribers from both profiles and newsletter_subscribers tables.
 */
export async function getUnifiedSubscribers(): Promise<Subscriber[]> {
  const [profilesRes, subscribersRes] = await Promise.all([
    supabase.from('profiles').select('email, name').not('email', 'is', null),
    supabase.from('newsletter_subscribers').select('email, first_name, last_name').eq('is_active', true)
  ]);

  const userMap = new Map<string, string>();
  
  // Add users from profiles
  profilesRes.data?.forEach(u => {
    if (u.email) {
      userMap.set(u.email.toLowerCase(), u.name || 'Valued Seeker');
    }
  });
  
  // Add users from newsletter_subscribers (overwriting or adding new)
  subscribersRes.data?.forEach(u => {
    if (u.email) {
      const email = u.email.toLowerCase();
      // If we already have the name from profiles, keep it unless it's generic
      const currentName = userMap.get(email);
      const newName = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Valued Seeker';
      
      if (!currentName || currentName === 'Valued Seeker') {
        userMap.set(email, newName);
      }
    }
  });

  return Array.from(userMap.entries()).map(([email, name]) => ({ email, name }));
}

/**
 * Syncs a user to the newsletter_subscribers table.
 */
export async function syncToSubscribers(email: string, name: string, source: string = 'system_sync', isNewsletterSubscriber: boolean = false) {
  if (!email) return;
  
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: email.toLowerCase(),
        first_name: name || email.split('@')[0],
        source,
        is_active: true,
        is_newsletter_subscriber: isNewsletterSubscriber
      }, { onConflict: 'email' });
      
    if (error) {
      console.error(`Error syncing ${email} to subscribers:`, error);
    }
  } catch (err) {
    console.error(`Exception syncing ${email} to subscribers:`, err);
  }
}

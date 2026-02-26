import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
import { newBlogPostTemplate } from '@/lib/email-templates';
import { getUnifiedSubscribers } from '@/lib/subscribers';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Get blog post data
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get all users from unified subscriber list
    const validUsers = await getUnifiedSubscribers();
    
    if (validUsers.length === 0) {
      return NextResponse.json({ error: 'No users found to send emails to' }, { status: 400 });
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Send to all users via Gmail SMTP (sequential with small delay)
    for (const user of validUsers) {
      try {
        const userName = user.name || 'Valued Seeker';
        const result = await sendEmail({
          to: user.email,
          subject: `New Article: ${post.title}`,
          html: newBlogPostTemplate(post, userName),
        });
        if (result.success) {
          sentCount++;
        } else {
          errors.push(`${user.email}: ${result.error}`);
        }
      } catch (err: any) {
        errors.push(`${user.email}: ${err.message}`);
      }
      // Small delay between sends to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({ success: true, totalUsers: sentCount, errors: errors.length > 0 ? errors : undefined });
  } catch (error: any) {
    console.error('Error sending blog notification emails:', error);
    return NextResponse.json({ error: error.message || 'Failed to send emails' }, { status: 500 });
  }
}

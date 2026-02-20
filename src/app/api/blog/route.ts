import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { newBlogPostTemplate } from '@/lib/email-templates';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Blog/Rashifal notifications → Resend (bulk newsletter-style)
async function sendBlogNotificationViaResend(post: {
  title: string;
  excerpt?: string;
  slug: string;
  category?: string;
  featured_image?: string;
}) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Katyaayani Astrologer <noreply@katyaayaniastrologer.com>';

    // Get all newsletter subscribers (active)
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('email, first_name')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      // Fallback: notify all registered users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, name');

      if (!profiles || profiles.length === 0) return;

      const BATCH_SIZE = 50;
      for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
        const batch = profiles.slice(i, i + BATCH_SIZE);
        const emails = batch.map((user) => ({
          from: fromEmail,
          to: user.email,
          subject: `New Blog Post: ${post.title} - Katyaayani Astrologer`,
          html: newBlogPostTemplate(post, user.name || 'Seeker'),
        }));
        await resend.batch.send(emails).catch((e) => console.error('Resend batch error:', e));
        if (i + BATCH_SIZE < profiles.length) await new Promise((r) => setTimeout(r, 300));
      }
      return;
    }

    const BATCH_SIZE = 50;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const emails = batch.map((sub) => ({
        from: fromEmail,
        to: sub.email,
        subject: `New Blog Post: ${post.title} - Katyaayani Astrologer`,
        html: newBlogPostTemplate(post, sub.first_name || 'Devotee'),
      }));
      await resend.batch.send(emails).catch((e) => console.error('Resend batch error:', e));
      if (i + BATCH_SIZE < subscribers.length) await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`Blog notification sent via Resend to ${subscribers.length} subscribers`);
  } catch (err) {
    console.error('Error sending blog notification via Resend:', err);
  }
}

// GET all blog posts (published only by default, all if admin=true)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const isAdmin = searchParams.get('admin') === 'true';
  
  try {
    let query = supabase
      .from('blog_posts')
      .select('*');
    
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }
    
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data, count });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST create new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      title_gujarati,
      title_hindi,
      slug,
      content, 
      content_gujarati,
      content_hindi,
      excerpt, 
      excerpt_gujarati,
      excerpt_hindi,
      featured_image, 
      category, 
      tags, 
      meta_title, 
      meta_description, 
      is_published 
    } = body;
    
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        title_gujarati,
        title_hindi,
        slug: finalSlug,
        content,
        content_gujarati,
        content_hindi,
        excerpt,
        excerpt_gujarati,
        excerpt_hindi,
        featured_image,
        category: category || 'general',
        tags: tags || [],
        meta_title,
        meta_description,
        is_published: is_published || false,
        published_at: is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();
    
    if (error) throw error;

    // Send notification via Resend if published
    if (is_published && data) {
      sendBlogNotificationViaResend({
        title: data.title,
        excerpt: data.excerpt,
        slug: data.slug,
        category: data.category,
        featured_image: data.featured_image,
      });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

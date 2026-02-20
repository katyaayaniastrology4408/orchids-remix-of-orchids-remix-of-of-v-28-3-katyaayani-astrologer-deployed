import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
import { newBlogPostTemplate } from '@/lib/email-templates';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic' ; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = 'https://www.katyaayaniastrologer.com';

function buildBlogEmailHtml(post: { title: string; excerpt?: string; slug: string; category?: string }, name: string): string {
  const blogUrl = `${BASE_URL}/blog/${post.slug}`;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Blog Post</title></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0800;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1000;border-radius:16px;overflow:hidden;border:1px solid #8b1a00;">
        <tr><td style="background:linear-gradient(135deg,#8b1a00,#c45200);padding:28px 24px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">📖</div>
          <h1 style="margin:0;color:#ffd700;font-size:22px;letter-spacing:2px;font-family:Georgia,serif;">Katyaayani Astrologer</h1>
          <p style="margin:8px 0 0;color:#ffb347;font-size:12px;letter-spacing:4px;text-transform:uppercase;">New Blog Post</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;text-align:center;">
          <p style="color:#ffd700;font-size:17px;margin:0;">Namaste ${name} 🙏</p>
          <p style="color:#d4a574;font-size:13px;margin:10px 0 0;">A new article has been published for you</p>
          <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);margin:16px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:20px 32px 0;text-align:center;">
          <span style="display:inline-block;background:#8b1a00;color:#ffd700;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:50px;">${post.category || 'Vedic Astrology'}</span>
        </td></tr>
        <tr><td style="padding:16px 32px 0;text-align:center;">
          <h2 style="color:#ffd700;font-size:22px;margin:0;line-height:1.4;">${post.title}</h2>
        </td></tr>
        <tr><td style="padding:20px 32px;">
          <div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:12px;padding:22px 24px;">
            <p style="color:#e8d5b7;font-size:15px;line-height:1.9;margin:0;">${post.excerpt || 'Read our latest article on Vedic astrology and cosmic wisdom.'}</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${blogUrl}" style="display:inline-block;background:linear-gradient(135deg,#c45200,#ff6b35);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Read Full Article</a>
        </td></tr>
        <tr><td style="background:#080500;padding:20px 32px;text-align:center;border-top:1px solid #8b1a00;">
          <p style="color:#6b3a1a;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
          <p style="color:#4a2a10;font-size:10px;margin:0;"><a href="${BASE_URL}" style="color:#6b3a1a;text-decoration:none;">katyaayaniastrologer.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendBlogNotificationToAllUsers(post: { title: string; excerpt?: string; slug: string; category?: string; featured_image?: string }) {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email, name');

    if (error || !profiles || profiles.length === 0) {
      console.warn('No users found for blog notification');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const BATCH_SIZE = 50;

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const emails = batch.map((user) => ({
        from: 'Katyaayani Astrologer <newsletter@katyaayaniastrologer.com>',
        to: user.email,
        subject: `New Blog Post: ${post.title} - Katyaayani Astrologer`,
        html: buildBlogEmailHtml(post, user.name || 'Seeker'),
      }));
      try {
        await resend.batch.send(emails);
      } catch (err) {
        console.error('Batch blog email error:', err);
      }
      if (i + BATCH_SIZE < profiles.length) await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Blog notification sent via Resend to ${profiles.length} users`);
  } catch (err) {
    console.error('Error sending blog notification emails:', err);
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
    
    // Generate slug from title if not provided
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

      // Send admin notification email
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && data) {
        sendEmail({
          to: adminEmail,
          subject: `Blog ${is_published ? 'Published' : 'Draft Created'}: ${data.title}`,
          html: newBlogPostTemplate(
            { title: data.title, excerpt: data.excerpt, slug: data.slug, category: data.category, featured_image: data.featured_image },
            'Admin'
          ),
        }).catch(err => console.error('Failed to send admin blog notification:', err));
      }

      // Send email notification to all users if blog is published
      if (is_published && data) {
        sendBlogNotificationToAllUsers({
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

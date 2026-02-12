import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.config';
import { newBlogPostTemplate } from '@/lib/email-templates';
export const dynamic = 'force-dynamic' ; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendBlogNotificationToAllUsers(post: { title: string; excerpt?: string; slug: string; category?: string; featured_image?: string }) {
  try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, name');

      if (error || !profiles || profiles.length === 0) {
        console.warn('No users found for blog notification');
        return;
      }

      const results = await Promise.allSettled(
        profiles.map(user => {
          const userName = user.name || 'Seeker';
        return sendEmail({
          to: user.email,
          subject: `New Blog Post: ${post.title} - Katyaayani Astrologer`,
          html: newBlogPostTemplate(post, userName),
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length;
    console.log(`Blog notification emails sent: ${successCount}/${profiles.length}`);
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

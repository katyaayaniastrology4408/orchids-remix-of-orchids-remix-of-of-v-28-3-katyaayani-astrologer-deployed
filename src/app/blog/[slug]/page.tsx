import { supabaseAdmin } from "@/lib/supabase";
import BlogPostClient from "@/components/blog/BlogPostClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Post Not Found" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.katyaayaniastrologer.com';
    let imageUrl = post.featured_image;
    
    // Ensure absolute URL
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${appUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    // Encode URL to handle spaces/special characters
    // Using encodeURI but also making sure we don't double encode if it's already encoded
    const encodedImageUrl = imageUrl.includes('%') ? imageUrl : encodeURI(imageUrl);

    // Add resizing parameters for Supabase if it's a Supabase URL
    // WhatsApp prefers smaller images for previews (under 300KB is safest)
    // We force JPG format as WhatsApp scraper often fails with WebP
    let resizedImageUrl = encodedImageUrl;
    if (encodedImageUrl.includes('supabase.co/storage/v1/object/public')) {
      const renderUrl = encodedImageUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
      const separator = renderUrl.includes('?') ? '&' : '?';
      resizedImageUrl = `${renderUrl}${separator}width=1200&height=630&resize=contain&format=jpg`;
    }

    return {
      metadataBase: new URL(appUrl),
      title: `${post.title} | Katyaayani Astrologer`,
      description: post.excerpt,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `/blog/${slug}`,
        siteName: "Katyaayani Astrologer",
        images: [
          {
            url: resizedImageUrl, // Try resized first (1200x630 is standard)
            width: 1200,
            height: 630,
            alt: post.title,
          },
          {
            url: encodedImageUrl, // Fallback to raw
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
        type: "article",
        publishedTime: post.published_at,
        authors: [post.author_name],
        section: post.category,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [resizedImageUrl],
      },
    };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const { data: relatedPosts } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("category", post.category)
    .eq("is_published", true)
    .neq("id", post.id)
    .limit(3);

  // Increment view count (fire and forget on server)
  supabaseAdmin.rpc('increment_view_count', { post_id: post.id }).then(() => {});

  return <BlogPostClient post={post} relatedPosts={relatedPosts || []} />;
}

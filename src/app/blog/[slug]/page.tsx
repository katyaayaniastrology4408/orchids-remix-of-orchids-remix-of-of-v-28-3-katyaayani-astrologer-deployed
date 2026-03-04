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
  
  // 1. Get Base Image URL
  let rawImageUrl = post.featured_image;
  if (rawImageUrl && !rawImageUrl.startsWith('http')) {
    rawImageUrl = `${appUrl}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;
  }

  // 2. Encode for safety (WhatsApp fails on spaces/special chars)
  // We use encodeURI to keep the protocol/slashes but encode spaces/etc.
  const encodedImageUrl = rawImageUrl ? encodeURI(rawImageUrl) : '';

  // 3. Optimize for WhatsApp (Must be JPG, <300KB, roughly 1200x630)
  let finalOgImageUrl = encodedImageUrl;
  if (encodedImageUrl.includes('supabase.co/storage/v1/object/public')) {
    // Transform to render URL
    const renderUrl = encodedImageUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const separator = renderUrl.includes('?') ? '&' : '?';
    // Force JPG, resize to standard OG size
    finalOgImageUrl = `${renderUrl}${separator}width=1200&height=630&resize=contain&format=jpg&quality=85`;
  }

  return {
    title: `${post.title} | Katyaayani Astrologer`,
    description: post.excerpt,
    metadataBase: new URL(appUrl),
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
          url: finalOgImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        },
      ],
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author_name],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [finalOgImageUrl],
    },
    other: {
      // Direct meta tags that WhatsApp likes
      'og:image:secure_url': finalOgImageUrl,
      'image': finalOgImageUrl,
    }
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

  // Increment view count
  supabaseAdmin.rpc('increment_view_count', { post_id: post.id }).catch(() => {});

  return <BlogPostClient post={post} relatedPosts={relatedPosts || []} />;
}

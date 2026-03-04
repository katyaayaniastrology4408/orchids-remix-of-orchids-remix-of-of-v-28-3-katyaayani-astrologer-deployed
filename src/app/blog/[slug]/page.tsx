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
  const imageUrl = post.featured_image.startsWith('http') 
    ? post.featured_image 
    : `${appUrl}${post.featured_image}`;

    const separator = imageUrl.includes('?') ? '&' : '?';
    const finalImageUrl = `${imageUrl}${separator}width=1200&height=630&resize=contain`;

    return {
      title: `${post.title} | Katyaayani Astrologer`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `${appUrl}/blog/${slug}`,
        siteName: "Katyaayani Astrologer",
        images: [
          {
            url: finalImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
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
        images: [finalImageUrl],
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

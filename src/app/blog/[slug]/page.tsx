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
    .from("blog")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Katyaayani Astrologer`,
    description: post.excerpt,
    openGraph: {
      images: [post.featured_image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabaseAdmin
    .from("blog")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const { data: relatedPosts } = await supabaseAdmin
    .from("blog")
    .select("*")
    .eq("category", post.category)
    .eq("is_published", true)
    .neq("id", post.id)
    .limit(3);

  // Increment view count (fire and forget on server)
  supabaseAdmin.rpc('increment_view_count', { post_id: post.id }).then(() => {});

  return <BlogPostClient post={post} relatedPosts={relatedPosts || []} />;
}

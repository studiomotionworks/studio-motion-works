import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/queries";
import { toContentBlocks } from "@/lib/content-blocks";
import { ArticleProgress } from "@/components/blog/ArticleProgress";
import { ArticleHeader } from "@/components/blog/ArticleHeader";
import { Prose } from "@/components/blog/Prose";
import { ShareRow } from "@/components/blog/ShareRow";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { NewsletterCTA } from "@/components/blog/NewsLetterCTA";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article Not Found — Kinetic" };
  return {
    title: `${post.title} — Kinetic Journal`,
    description: post.excerpt,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const blocks = toContentBlocks(post.content);

  return (
    <>
      <ArticleProgress />

      <ArticleHeader post={post} />

      <div className="px-6">
        <div className="mx-auto max-w-3xl">
          <Prose blocks={blocks} />

          <ShareRow title={post.title} />

          {/* authorBio / authorRole now live directly on the post
              (Payload), so there's no separate postContent lookup */}
          <AuthorCard
            post={post}
            bio={post.authorBio ?? ''}
            role={post.authorRole ?? ''}
          />

          <NewsletterCTA />

          <RelatedPosts current={post} allPosts={allPosts} />
        </div>
      </div>

      {/* Bottom breathing room */}
      <div className="h-32" />
    </>
  );
}

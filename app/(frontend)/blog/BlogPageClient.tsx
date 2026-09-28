"use client";

import { useState } from "react";
import { BlogHero } from "@/components/blog/BlogHero";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import type { Post } from "@/payload-types";

export function BlogPageClient({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const featured = posts.find((p) => p.featured);

  return (
    <>
      <ReadingProgress />

      <BlogHero
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {featured && activeCategory === "All" && <FeaturedPost post={featured} />}

      <BlogGrid posts={posts} activeCategory={activeCategory} />
    </>
  );
}

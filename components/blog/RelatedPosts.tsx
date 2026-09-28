"use client";

import { motion } from "framer-motion";
import { BlogCard } from "./BlogCard";
import type { Post } from "@/payload-types";

export function RelatedPosts({
  current,
  allPosts,
}: {
  current: Post;
  allPosts: Post[];
}) {
  const related = allPosts
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => {
      // Prefer same category first
      if (a.category === current.category && b.category !== current.category)
        return -1;
      if (b.category === current.category && a.category !== current.category)
        return 1;
      return 0;
    })
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-24">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze">
            Continue Reading
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.3rem,2.5vw,2rem)] font-bold tracking-tight text-ink">
            Related Notes
          </h2>
        </div>
        <span className="hidden h-px flex-1 mx-8 bg-border md:block" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              delay: i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <BlogCard post={post} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

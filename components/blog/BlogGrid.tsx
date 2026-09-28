"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BlogCard } from "./BlogCard";
import type { Post } from "@/payload-types";

export function BlogGrid({
  posts,
  activeCategory,
}: {
  posts: Post[];
  activeCategory: string;
}) {
  const filtered =
    activeCategory === "All"
      ? posts.filter((p) => !p.featured)
      : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="px-6 pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
            {activeCategory === "All"
              ? "All Articles"
              : `${activeCategory} — ${filtered.length} article${filtered.length !== 1 ? "s" : ""}`}
          </span>
          <span className="h-px flex-1 mx-6 bg-border" />
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((post) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <p className="font-body text-sm text-ink-muted">
              No articles in this category yet.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
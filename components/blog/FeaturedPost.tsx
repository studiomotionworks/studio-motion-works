"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Post } from "@/payload-types";

export function FeaturedPost({ post }: { post: Post }) {
  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="group relative overflow-hidden rounded-sm border border-border bg-surface"
        >
          <Link href={`/blog/${post.slug}`} className="grid md:grid-cols-2">
            {/* Visual side */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gunmetal md:aspect-auto md:min-h-[420px]">
              {/* Placeholder — replace with video or image */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(circle at 40% 50%, ${post.accent}50, transparent 70%)`,
                }}
              />
              {/* Concentric rings animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full border border-bronze/20"
                    style={{
                      width: `${ring * 100}px`,
                      height: `${ring * 100}px`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20 + ring * 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              {/* "Featured" badge */}
              <div className="absolute left-5 top-5">
                <span className="rounded-full border border-bronze/30 bg-void/60 px-3 py-1 font-body text-[9px] tracking-[0.3em] uppercase text-bronze backdrop-blur-sm">
                  Featured
                </span>
              </div>
            </div>

            {/* Content side */}
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span
                className="font-body text-[9px] tracking-[0.3em] uppercase"
                style={{ color: post.accent ?? '' }}
              >
                {post.category}
              </span>

              <h2 className="mt-4 font-display text-2xl font-bold leading-[1.1] tracking-tight text-ink transition-colors duration-500 group-hover:text-bronze md:text-4xl">
                {post.title}
              </h2>

              <p className="mt-5 max-w-md font-body text-sm leading-relaxed text-ink-muted">
                {post.excerpt}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <span className="font-body text-[10px] tracking-[0.15em] text-ink">
                  {post.author}
                </span>
                <span className="h-px w-6 bg-border" />
                <span className="font-body text-[10px] tracking-[0.2em] text-ink-subtle">
                  {post.readTime}
                </span>
                <span className="h-px w-6 bg-border" />
                <span className="font-body text-[10px] tracking-[0.2em] text-ink-subtle">
                  {new Date(post.publishedAt ?? '').toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
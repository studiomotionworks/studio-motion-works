"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KineticText } from "@/components/ui/KineticText";
import type { Post } from "@/payload-types";

export function ArticleHeader({ post }: { post: Post }) {
  return (
    <header className="relative px-6 pt-32 pb-16 md:pt-40 md:pb-20">
      {/* Ambient glow */}
      <div className="kinetic-glow pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-4xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Link
            href="/blog"
            data-magnetic
            className="group inline-flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase text-ink-muted transition-colors hover:text-bronze"
          >
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="text-current"
              initial={false}
              whileHover={{ x: -3 }}
            >
              <path
                d="M13 3L3 13M3 13H11M3 13V5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            The Journal
          </Link>
        </motion.div>

        {/* Category */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 block font-body text-[10px] tracking-[0.4em] uppercase"
          style={{ color: post.accent ?? '' }}
        >
          {post.category}
        </motion.span>

        {/* Title */}
        <div className="mt-6">
          <KineticText
            text={post.title}
            as="h1"
            className="font-display text-[clamp(1.8rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight text-ink"
            staggerDelay={0.02}
          />
        </div>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6"
        >
          <div className="flex items-center gap-3">
            {/* Author avatar placeholder */}
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-gunmetal">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(circle at 40% 40%, ${post.accent}, transparent 70%)`,
                }}
              />
            </div>
            <span className="font-body text-xs tracking-[0.1em] text-ink">
              {post.author}
            </span>
          </div>

          <span className="h-3 w-px bg-border" />

          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-ink-subtle">
            {new Date(post.publishedAt ?? '').toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <span className="h-3 w-px bg-border" />

          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-ink-subtle">
            {post.readTime} read
          </span>
        </motion.div>
      </div>
    </header>
  );
}

"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import type { Post } from "@/payload-types";

export function BlogCard({ post }: { post: Post }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotateX.set((e.clientY - centerY) * -0.05);
    rotateY.set((e.clientX - centerX) * 0.05);
  };

  return (
    <motion.div
      ref={ref}
      data-magnetic
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="group relative overflow-hidden rounded-sm border border-border bg-surface transition-colors duration-500"
    >
      {/* Accent radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${post.accent}15, transparent 70%)`,
        }}
      />

      {/* Hover border ring */}
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full border border-bronze/10 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:border-bronze/25"
        style={{ boxShadow: `0 0 80px ${post.accent}20` }}
      />

      <Link
        href={`/blog/${post.slug}`}
        className="relative z-10 flex h-full flex-col p-7"
      >
        {/* Meta row */}
        <div className="mb-6 flex items-center justify-between">
          <span
            className="font-body text-[9px] tracking-[0.3em] uppercase"
            style={{ color: post.accent ?? '' }}
          >
            {post.category}
          </span>
          <span className="font-body text-[9px] tracking-[0.2em] text-ink-subtle">
            {post.readTime}
          </span>
        </div>

        {/* Title — kinetic on hover */}
        <h3 className="font-display text-xl font-bold leading-[1.15] tracking-tight text-ink transition-colors duration-300 group-hover:text-bronze md:text-2xl">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-4 flex-1 font-body text-xs leading-relaxed text-ink-muted">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[10px] tracking-[0.15em] text-ink">
              {post.author}
            </span>
            <span className="font-body text-[9px] tracking-[0.2em] text-ink-subtle">
              {new Date(post.publishedAt ?? '').toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Arrow that slides on hover */}
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-ink-subtle transition-colors duration-300 group-hover:text-bronze"
            initial={false}
            animate={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            <path
              d="M3 13L13 3M13 3H5M13 3V11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
      </Link>
    </motion.div>
  );
}

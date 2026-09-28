"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import type { Post } from "@/payload-types";

export function AuthorCard({
  post,
  bio,
  role,
}: {
  post: Post;
  bio: string;
  role: string;
}) {
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
    rotateX.set((e.clientY - centerY) * -0.03);
    rotateY.set((e.clientX - centerX) * 0.03);
  };

  return (
    <motion.div
      ref={ref}
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm border border-border bg-surface p-8 md:p-10"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-40 blur-[80px]"
        style={{ background: post.accent ?? '' }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        {/* Avatar */}
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute inset-0 rounded-full border border-bronze/30" />
          <motion.div
            className="absolute inset-0 rounded-full border border-bronze/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-full bg-gunmetal">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${post.accent}, transparent 70%)`,
              }}
            />
            <span className="relative font-display text-xl font-bold text-ink">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-bronze">
            Written by
          </span>
          <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
            {post.author}
          </h3>
          <p className="mt-1 font-body text-[10px] tracking-[0.2em] uppercase text-ink-subtle">
            {role}
          </p>
          <p className="mt-4 font-body text-sm leading-relaxed text-ink-muted">
            {bio}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Event } from "@/payload-types";

function MotionBlurCard({ event, index }: { event: Event; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const blurAmount = useSpring(6, { stiffness: 200, damping: 20 });
  const scale = useSpring(1.08, { stiffness: 200, damping: 20 });
  const rotation = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    rotation.set((x - 0.5) * 4);
  };

  const handleMouseEnter = () => {
    blurAmount.set(0);
    scale.set(1);
  };

  const handleMouseLeave = () => {
    blurAmount.set(6);
    scale.set(1.08);
    rotation.set(0);
  };

  // Translate based on cursor for parallax
  const px = useTransform(mouseX, [0, 1], [8, -8]);
  const py = useTransform(mouseY, [0, 1], [8, -8]);

  // Alternate offsets to create a staggered, cascading look
  const isOffset = index % 2 === 1;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative cursor-pointer ${isOffset ? "md:mt-20" : ""}`}
      style={{
        rotate: rotation,
        perspective: 1200,
      }}
    >
      <motion.div
        style={{
          scale,
          x: px,
          y: py,
        }}
        className="relative aspect-[4/5] overflow-hidden rounded-sm border border-border bg-gunmetal"
      >
        {/* Blurred background layer (motion) */}
        <motion.div
          className="absolute inset-0"
          style={{
            filter: useTransform(blurAmount, (v) => `blur(${v}px)`),
          }}
        >
          {/* Accent radial representing the event's visual */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 40%, ${event.accent}40, transparent 65%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(160deg, ${event.accent}20 0%, transparent 40%, ${event.accent}10 100%)`,
            }}
          />
        </motion.div>

        {/* Concentric motion rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border"
              style={{
                width: `${ring * 30}%`,
                height: `${ring * 30}%`,
                borderColor: `${event.accent}25`,
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + ring,
                repeat: Infinity,
                delay: ring * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-center gap-3">
            <span
              className="font-body text-[9px] tracking-[0.3em] uppercase"
              style={{ color: event.accent ?? "" }}
            >
              {event.category}
            </span>
            <span className="h-px w-6 bg-bronze/30" />
            <span className="font-body text-[9px] tracking-[0.2em] uppercase text-ink-subtle">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold leading-tight tracking-tight text-ink md:text-xl">
            {event.title}
          </h3>

          <p className="mt-2 font-body text-[10px] tracking-[0.2em] uppercase text-ink-muted">
            {event.city}, {event.country}
          </p>
        </div>

        {/* Hover indicator */}
        <motion.div
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-bronze/40 bg-void/60 backdrop-blur-sm"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          style={{ animationPlayState: "running" }}
          variants={{
            hover: { scale: 1, opacity: 1 },
            rest: { scale: 0, opacity: 0 },
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8H13M13 8L9 4M13 8L9 12"
              stroke="#C5A065"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function MotionBlurGallery({ events }: { events: Event[] }) {
  return (
    <section className="relative px-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze">
              From the Archive
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-tight text-ink">
              Past Events
            </h2>
          </div>
          <span className="hidden h-px flex-1 bg-border mx-8 md:block" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
            {events.length} Moments
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <MotionBlurCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

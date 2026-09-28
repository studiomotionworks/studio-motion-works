"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KineticText } from "@/components/ui/KineticText";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="kinetic-glow pointer-events-none absolute inset-0" />

      {/* Broken rotating ring */}
      <div className="relative mb-12 flex h-40 w-40 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-bronze/25"
            style={{
              width: `${(i + 1) * 50}px`,
              height: `${(i + 1) * 50}px`,
              borderTopColor: "transparent",
              borderRightColor: "transparent",
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 12 + i * 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        <span className="font-display text-2xl font-bold text-bronze">404</span>
      </div>

      <KineticText
        text="THIS NOTE HAS DRIFTED."
        as="h1"
        className="text-center font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-ink"
        staggerDelay={0.03}
      />

      <p className="mt-6 max-w-md text-center font-body text-sm leading-relaxed text-ink-muted">
        The article you're looking for has moved, been removed, or never
        existed. Return to the journal to find something still in motion.
      </p>

      <Link
        href="/blog"
        data-magnetic
        className="group relative mt-12 overflow-hidden rounded-full border border-bronze/40 px-8 py-3.5 font-body text-[10px] tracking-[0.3em] uppercase text-bronze transition-colors duration-500 hover:text-void"
      >
        <span className="absolute inset-0 origin-left scale-x-0 bg-bronze transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        <span className="relative z-10">Return to Journal</span>
      </Link>
    </section>
  );
}
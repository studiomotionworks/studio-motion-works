"use client";

import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import Link from "next/link";

const works = [
  {
    id: "zephyr",
    title: "Zephyr",
    category: "Commissioned Work",
    year: "2021",
    color: "#C5A065",
    videoUrl:
      "https://ky7bb3jva0qgai9o.public.blob.vercel-storage.com/zephyr.mp4",
  },
  {
    id: "firefly",
    title: "Firefly",
    category: "Kinetic Luminaries",
    year: "2019",
    color: "#B87333",
    videoUrl:
      "https://ky7bb3jva0qgai9o.public.blob.vercel-storage.com/firefly.mp4",
  },
  {
    id: "flying",
    title: "Flying Peacock",
    category: "Commissioned Work",
    year: "2015",
    color: "#C5A065",
    videoUrl:
      "https://ky7bb3jva0qgai9o.public.blob.vercel-storage.com/flying.mp4",
  },
  {
    id: "sleek",
    title: "Sleek",
    category: "Kinetic Luminaries",
    year: "2022",
    color: "#C0C0C0",
    videoUrl:
      "https://ky7bb3jva0qgai9o.public.blob.vercel-storage.com/sleek.mp4",
  },
];

function TiltCard({ work }: { work: (typeof works)[0] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Every card that's in view plays — no artificial "only one at a time"
  // restriction, since on wide screens all 4 columns are visible together.
  const isInView = useInView(containerRef, { amount: 0.3, margin: "50px" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      // Small debounce: if the user is scrolling fast, don't bother
      // starting a load/decode for a card they're about to scroll past.
      const timer = setTimeout(() => {
        if (video.getAttribute("src") !== work.videoUrl) {
          video.src = work.videoUrl;
          video.load();
        }
        video.play().catch(() => {
          // Autoplay can be blocked before any user interaction; safe to ignore.
        });
      }, 120);

      return () => clearTimeout(timer);
    }

    // Out of view: fully release the decode buffer and network connection
    // (not just pause) so scrolled-past cards stop costing memory/GPU.
    video.pause();
    video.removeAttribute("src");
    video.load();
  }, [isInView, work.videoUrl]);

  // Tilt mouse interaction
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotateX.set((e.clientY - centerY) * -0.06);
    rotateY.set((e.clientX - centerX) * 0.06);
  };

  return (
    <motion.div
      ref={containerRef}
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
      // content-visibility lets the browser skip layout/paint work for
      // cards that are far offscreen, which matters more as the list grows.
      className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gunmetal [content-visibility:auto] [contain-intrinsic-size:0_600px]"
    >
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Radial Gradient Overlay — also doubles as the placeholder look
          before/without an active video */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-50"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${work.color}40, transparent 70%)`,
        }}
      />

      <div
        className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full border border-bronze/20 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:border-bronze/40"
        style={{ boxShadow: `0 0 60px ${work.color}30` }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 bg-gradient-to-t from-void/90 via-void/30 to-transparent">
        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-bronze/70">
          {work.category}
        </span>
        <h3 className="mt-2 font-display text-xl font-bold text-offwhite md:text-2xl">
          {work.title}
        </h3>
        <span className="mt-1 font-body text-[10px] tracking-[0.2em] text-mist/50">
          {work.year}
        </span>
      </div>
    </motion.div>
  );
}

export function FeaturedWorks() {
  return (
    <section className="relative px-6 py-24 md:py-32 bg-void">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze/60">
              Selected Works
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight text-offwhite">
              Gallery of Motion
            </h2>
          </div>
          <Link
            href="/projects"
            data-magnetic
            className="hidden font-body text-xs tracking-[0.2em] uppercase text-mist transition-colors hover:text-bronze md:block"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {works.map((work) => (
            <TiltCard key={work.id} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}

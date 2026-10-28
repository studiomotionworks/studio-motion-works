"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/payload-types";

export function HorizontalGallery({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useLayoutEffect(() => {
    const rail = containerRef.current;
    const viewport = viewportRef.current;
    if (!rail || !viewport) return;

    const measure = () => {
      setScrollDistance(Math.max(0, rail.scrollWidth - viewport.clientWidth));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [projects]);

  // Track vertical scroll through the section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // End the sticky section exactly when the final item and padding fit onscreen.
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -scrollDistance],
  );

  return (
    <section
      ref={targetRef}
      className="relative"
      style={{ height: `calc(100vh + ${scrollDistance}px)` }}
    >
      <div ref={viewportRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Section label — fixed to the left */}
        <div className="absolute left-6 top-24 z-20 hidden md:block">
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-ink-subtle">
            Scroll to explore
          </span>
          <motion.div
            className="mt-3 h-px w-full origin-left bg-bronze"
            style={{ scaleX: scrollYProgress }}
          />
        </div>

        {/* Horizontal rail */}
        <motion.div
          ref={containerRef}
          style={{ x }}
          className="flex w-max shrink-0 gap-8 px-[10vw] will-change-transform"
        >
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onOpen={onOpen}
            />
          ))}

          {/* End cap */}
          <div className="flex w-[40vw] shrink-0 items-center justify-center self-stretch">
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-ink-subtle">
                More coming soon
              </span>
              <p className="mt-2 font-body text-xs tracking-[0.2em] uppercase text-ink-subtle/60">
                2026–2027
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
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

  // Track vertical scroll through the section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Map vertical progress to horizontal translation
  // Each card is ~520px wide + gap; total width = projects.length * 560
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["1%", `-${(projects.length - 1) * 70}%`],
  );

  // Progress indicator
  const progressX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={targetRef}
      className="relative h-[400vh]" // 4x viewport height for scroll distance
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Section label — fixed to the left */}
        <div className="absolute left-6 top-24 z-20 hidden md:block">
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-ink-subtle">
            Scroll to explore
          </span>
          <motion.div
            className="mt-3 h-px origin-left bg-bronze"
            style={{ scaleX: progressX }}
          />
        </div>

        {/* Horizontal rail */}
        <motion.div
          ref={containerRef}
          style={{ x }}
          className="flex gap-8 px-[10vw] will-change-transform"
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
          <div className="flex h-full w-[40vw] shrink-0 items-center justify-center">
            <div className="text-center">
              <span className="font-display text-2xl font-bold text-ink-subtle">
                More coming
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

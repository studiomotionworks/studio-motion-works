"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { notableProjects } from "@/data/about";
import type { NotableProject } from "@/data/about";

function ProjectTile({ project, index }: { project: NotableProject; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const srX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const srY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rotateX.set((e.clientY - (rect.top + rect.height / 2)) * -0.04);
    rotateY.set((e.clientX - (rect.left + rect.width / 2)) * 0.04);
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
        rotateX: srX,
        rotateY: srY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative overflow-hidden rounded-sm border border-border bg-surface p-7"
    >
      {/* Accent glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${project.accent}15, transparent 70%)`,
        }}
      />

      {/* Category chip */}
      <span
        className="relative font-body text-[9px] tracking-[0.3em] uppercase"
        style={{ color: project.accent ?? ''}}
      >
        {project.category}
      </span>

      {/* Title */}
      <h3 className="relative mt-4 font-display text-lg font-bold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-bronze md:text-xl">
        {project.title}
      </h3>

      {/* Client & location */}
      <div className="relative mt-2 flex flex-col gap-0.5">
        <span className="font-body text-[11px] tracking-[0.05em] text-ink-muted">
          {project.client}
        </span>
        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-ink-subtle">
          {project.location}
        </span>
      </div>

      {/* Note */}
      <p className="relative mt-5 font-body text-xs leading-[1.75] text-ink-muted">
        {project.note}
      </p>

      {/* Corner accent */}
      <div
        className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${project.accent}20, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

export function NotableProjects() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze"
            >
              Selected Clients
            </motion.span>

            <h2 className="mt-6 max-w-xl font-display text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-ink">
              Work that moves in{" "}
              <span className="text-bronze">public space.</span>
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-sm font-body text-sm leading-relaxed text-ink-muted"
          >
            From international airport terminals to museum halls and corporate
            campuses — pieces that must live, daily, with the public.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notableProjects.map((project, i) => (
            <ProjectTile key={project.id} project={project} index={i} />
          ))}

          {/* "And more" tile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative flex flex-col justify-between overflow-hidden rounded-sm border border-dashed border-border p-7"
          >
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle">
              Continuing
            </span>
            <div className="mt-4">
              <p className="font-display text-lg font-bold tracking-tight text-ink-muted">
                And more, in motion
              </p>
              <p className="mt-3 font-body text-xs leading-relaxed text-ink-subtle">
                Public art, museum installations, and private commissions
                across India — with new work always in development.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
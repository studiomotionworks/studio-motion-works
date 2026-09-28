"use client";

import { motion } from "framer-motion";
import type { Project } from "@/payload-types";

export function ProjectList({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
}) {
  return (
    <section className="px-6 pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="border-t border-border">
          {projects.map((project, i) => (
            <motion.button
              key={project.id}
              data-magnetic
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => onOpen(project)}
              className="group flex w-full items-center gap-6 border-b border-border py-8 text-left transition-colors duration-300 hover:bg-surface/50"
            >
              {/* Index */}
              <span className="w-16 shrink-0 font-display text-2xl font-bold text-ink-subtle/30 transition-colors duration-300 group-hover:text-bronze">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Title & subtitle */}
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-bronze md:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-1 font-body text-xs text-ink-muted">
                  {project.subtitle}
                </p>
              </div>

              {/* Category */}
              <span
                className="hidden font-body text-[9px] tracking-[0.3em] uppercase md:block"
                style={{ color: project.accent ?? "" }}
              >
                {project.category}
              </span>

              {/* Year */}
              <span className="hidden w-16 font-body text-[10px] tracking-[0.2em] text-ink-subtle md:block">
                {project.year}
              </span>

              {/* Arrow */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-ink-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-bronze"
              >
                <path
                  d="M3 13L13 3M13 3H5M13 3V11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

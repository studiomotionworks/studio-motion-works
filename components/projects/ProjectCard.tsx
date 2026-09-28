"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { View } from "@react-three/drei";
import { HelixPreview } from "./previews/HelixPreview";
import { OrbitPreview } from "./previews/OrbitPreview";
import { TidePreview } from "./previews/TidePreview";
import { PulsePreview } from "./previews/PulsePreview";
import type { Project } from "@/payload-types";

const previewMap: Record<string, React.ComponentType> = {
  helix: HelixPreview,
  orbit: OrbitPreview,
  tide: TidePreview,
  pulse: PulsePreview,
};

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotateX.set((e.clientY - centerY) * -0.02);
    rotateY.set((e.clientX - centerX) * 0.02);
  };

  const PreviewComponent = previewMap[project.id];

  return (
    <motion.div
      ref={ref}
      data-magnetic
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        rotateX.set(0);
        rotateY.set(0);
      }}
      onClick={() => onOpen(project)}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      className="group relative h-[70vh] w-[80vw] shrink-0 cursor-pointer overflow-hidden rounded-sm border border-border bg-surface md:w-[520px]"
    >
      {/* 3D Preview — only rendered when hovered to save GPU */}
      {PreviewComponent && (
        <View
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ pointerEvents: "none" }}
        >
          <PreviewComponent />
        </View>
      )}

      {/* Fallback visual */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-0"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${project.accent}40, transparent 70%)`,
        }}
      />

      {/* Concentric ring decoration */}
      <div className="absolute -right-24 -top-24 h-64 w-64">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-bronze/10"
            style={{
              margin: `${(3 - ring) * 24}px`,
            }}
            animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 30 + ring * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Index number */}
      <div className="absolute left-6 top-6 z-20">
        <span className="font-display text-5xl font-bold text-ink-subtle/20">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Category badge */}
      <div className="absolute right-6 top-6 z-20">
        <span
          className="rounded-full border px-3 py-1 font-body text-[9px] tracking-[0.3em] uppercase backdrop-blur-sm"
          style={{
            borderColor: `${project.accent}40`,
            color: project.accent ?? '',
            backgroundColor: "rgba(18,18,18,0.4)",
          }}
        >
          {project.category}
        </span>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-8">
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
          {project.year} — {project.location}
        </span>
        <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-bronze md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-2 font-body text-sm text-ink-muted">
          {project.subtitle}
        </p>

        {/* Materials row */}
        <div className="mt-5 flex flex-wrap gap-2">
          {project?.materials?.slice(0, 3).map((mat) => (
            <span
              key={mat}
              className="rounded-full border border-border px-3 py-1 font-body text-[9px] tracking-[0.15em] uppercase text-ink-subtle"
            >
              {mat}
            </span>
          ))}
        </div>
      </div>

      {/* Hover gradient overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 50%)",
        }}
        animate={{ opacity: isHovered ? 1 : 0.6 }}
        transition={{ duration: 0.5 }}
      />

      {/* "View" affordance */}
      <motion.div
        className="absolute bottom-8 right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-bronze/40 bg-void/60 backdrop-blur-sm"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
  );
}

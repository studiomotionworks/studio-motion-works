"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Project } from "@/payload-types";

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const uploadedCover = project.cover && typeof project.cover === "object" ? project.cover : null;
  const cover = uploadedCover?.sizes?.card?.url || project.coverImage;
  const video = project.video;

  useEffect(() => {
    const card = ref.current;
    if (!card || cover || !video) return;
    // Offscreen cards should not fetch or decode video just to build a preview.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadVideo(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(card);
    return () => observer.disconnect();
  }, [cover, video]);

  return (
    <button
      type="button"
      aria-label={`View ${project.title}`}
      ref={ref}
      onClick={() => onOpen(project)}
      className="group relative text-left focus-visible:outline-2 focus-visible:outline-bronze h-[70vh] w-[80vw] shrink-0 cursor-pointer overflow-hidden rounded-sm border border-border bg-surface md:w-[520px]"
    >
      {cover ? (
        <Image
          src={cover}
          alt={project.title}
          fill
          sizes="(min-width: 768px) 520px, 80vw"
          className="pointer-events-none object-cover"
        />
      ) : video && loadVideo ? (
        <video
          src={video}
          muted
          playsInline
          preload="metadata"
          controls={false}
          onLoadedMetadata={(event) => {
            // Decode a still frame without starting playback.
            event.currentTarget.currentTime = 0.001;
          }}
          onLoadedData={(event) => event.currentTarget.pause()}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}

      {/* Fallback visual */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-0"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${project.accent}40, transparent 70%)`,
        }}
      />

      {/* Index number */}
      <div className="absolute left-6 top-6 z-20">
        <span className="font-display text-5xl font-bold text-ink-subtle/20">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Category badge */}
      <div className="absolute right-6 top-6 z-20">
        <span
          className="rounded-full border px-3 py-1 font-body text-[9px] tracking-[0.3em] uppercase"
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
      <div className="absolute inset-x-0 bottom-0 z-20 p-8 [&_.text-ink]:text-white [&_.text-ink-muted]:text-white/80 [&_.text-ink-subtle]:text-white/70">
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

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 65%)" }}
      />

      <div className="absolute bottom-8 right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-bronze/40 bg-void/80 transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8H13M13 8L9 4M13 8L9 12"
            stroke="#C5A065"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}

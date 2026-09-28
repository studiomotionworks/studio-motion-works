"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PresentationControls,
} from "@react-three/drei";
import { HelixModel } from "./models/HelixModel";
import { PulseModel } from "./models/PulseModel";
import type { Project } from "@/payload-types";

const modelMap: Record<string, React.ComponentType> = {
  helix: HelixModel,
  pulse: PulseModel,
};

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"story" | "specs">("story");
  const [sliderPos, setSliderPos] = useState(50);

  // Lock body scroll
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  // Esc to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const ModelComponent = project ? modelMap[project.id] : null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[500] overflow-y-auto bg-void/98 backdrop-blur-xl"
        >
          {/* Close button */}
          <motion.button
            data-magnetic
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="fixed right-6 top-6 z-[510] flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface/80 backdrop-blur-sm transition-colors hover:border-bronze/40"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="#C5A065"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>

          <div className="mx-auto max-w-6xl px-6 py-24">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span
                className="font-body text-[10px] tracking-[0.4em] uppercase"
                style={{ color: project.accent ?? '' }}
              >
                {project.category} — {project.year}
              </span>
              <h2 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-tight text-ink">
                {project.title}
              </h2>
              <p className="mt-3 font-body text-lg text-ink-muted">
                {project.subtitle}
              </p>
            </motion.div>

            {/* 3D Model Viewer */}
            {ModelComponent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 aspect-[16/9] overflow-hidden rounded-sm border border-border bg-gunmetal"
              >
                <Canvas
                  camera={{ position: [3, 2, 4], fov: 40 }}
                  dpr={[1, 2]}
                  gl={{ antialias: true, alpha: true }}
                >
                  <ambientLight intensity={0.3} />
                  <directionalLight position={[5, 8, 5]} intensity={1.5} />
                  <PresentationControls
                    global
                    rotation={[0.1, 0.3, 0]}
                    polar={[-0.3, 0.3]}
                    azimuth={[-0.5, 0.5]}
                  >
                    <ModelComponent />
                  </PresentationControls>
                  <ContactShadows
                    position={[0, -1.2, 0]}
                    opacity={0.4}
                    scale={8}
                    blur={2.5}
                  />
                  <Environment preset="studio" environmentIntensity={0.4} />
                </Canvas>
              </motion.div>
            )}

            {/* Before/After Slider (placeholder for projects with images) */}
            {(project?.images?.length ?? 0) >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-8"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
                    Configuration Comparison
                  </span>
                  <span className="font-body text-[10px] tracking-[0.2em] text-bronze">
                    {sliderPos}%
                  </span>
                </div>
                <div className="relative aspect-[16/9] overflow-hidden rounded-sm border border-border bg-gunmetal">
                  {/* Before (left side) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 30% 50%, ${project.accent}40, transparent 70%)`,
                    }}
                  />
                  {/* After (clipped by slider) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: `inset(0 0 0 ${sliderPos}%)`,
                      background: `radial-gradient(circle at 70% 50%, ${project.accent}60, transparent 70%)`,
                    }}
                  />
                  {/* Slider handle */}
                  <div
                    className="absolute top-0 bottom-0 w-px cursor-ew-resize bg-bronze"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const startPos = sliderPos;
                      const handleMove = (moveEvent: MouseEvent) => {
                        const delta =
                          ((moveEvent.clientX - startX) / window.innerWidth) *
                          100;
                        setSliderPos(
                          Math.max(5, Math.min(95, startPos + delta)),
                        );
                      };
                      const handleUp = () => {
                        window.removeEventListener("mousemove", handleMove);
                        window.removeEventListener("mouseup", handleUp);
                      };
                      window.addEventListener("mousemove", handleMove);
                      window.addEventListener("mouseup", handleUp);
                    }}
                  >
                    <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bronze bg-void/80 backdrop-blur-sm">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M4 2L1 6L4 10M8 2L11 6L8 10"
                          stroke="#C5A065"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-16 flex gap-1 border-b border-border"
            >
              {(["story", "specs"] as const).map((tab) => (
                <button
                  key={tab}
                  data-magnetic
                  onClick={() => setActiveTab(tab)}
                  className="relative px-6 py-4 font-body text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
                >
                  <span
                    className={
                      activeTab === tab
                        ? "text-bronze"
                        : "text-ink-subtle hover:text-ink"
                    }
                  >
                    {tab === "story" ? "The Story" : "Technical Specs"}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="modal-tab"
                      className="absolute bottom-0 left-0 right-0 h-px bg-bronze"
                    />
                  )}
                </button>
              ))}
            </motion.div>

            {/* Tab content */}
            <div className="mt-10">
              <AnimatePresence mode="wait">
                {activeTab === "story" ? (
                  <motion.div
                    key="story"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="max-w-3xl font-body text-base leading-[1.8] text-ink-muted">
                      {project.story}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                      {project?.specs?.map((spec, i) => (
                        <motion.div
                          key={spec.label}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="bg-surface p-6"
                        >
                          <span className="font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle">
                            {spec.label}
                          </span>
                          <p className="mt-2 font-display text-sm font-bold tracking-tight text-ink">
                            {spec.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-8"
            >
              {[
                { label: "Client", value: project.client || "Private" },
                { label: "Location", value: project.location },
                { label: "Duration", value: project.duration },
                { label: "Dimensions", value: project.dimensions },
              ].map((item) => (
                <div key={item.label}>
                  <span className="font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle">
                    {item.label}
                  </span>
                  <p className="mt-1 font-body text-sm text-ink">
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

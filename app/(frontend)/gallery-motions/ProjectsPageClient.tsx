"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ProjectsHero } from "@/components/design/projects/ProjectsHero";
import { HorizontalGallery } from "@/components/design/projects/HorizontalGallery";
import { ProjectList } from "@/components/design/projects/ProjectList";
import type { Project } from "@/payload-types";

const ProjectModal = dynamic(
  () => import("@/components/design/projects/ProjectModal").then((module) => module.ProjectModal),
  { ssr: false },
);

export function ProjectsPageClient({ projects: allProjects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchCategory =
        activeCategory === "All" || p.category === activeCategory;
      const matchYear = activeYear === "All" || p.year === activeYear;
      return matchCategory && matchYear;
    });
  }, [allProjects, activeCategory, activeYear]);

  return (
    <>
      <div className="relative z-10">
        <ProjectsHero
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeYear={activeYear}
          onYearChange={setActiveYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {filteredProjects.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-center">
            <p className="font-body text-sm tracking-[0.2em] uppercase text-ink-subtle">
              No works found for{" "}
              {activeYear !== "All" ? `year ${activeYear}` : ""}{" "}
              {activeCategory !== "All" ? `in ${activeCategory}` : ""}.
            </p>
          </div>
        ) : viewMode === "gallery" ? (
          <HorizontalGallery
            key={`${activeCategory}-${activeYear}`}
            projects={filteredProjects}
            onOpen={setSelectedProject}
          />
        ) : (
          <ProjectList
            projects={filteredProjects}
            onOpen={setSelectedProject}
          />
        )}
      </div>

      {selectedProject && (
        <ProjectModal
          key={selectedProject.id}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

"use client";

import { useState, useMemo } from "react";
import { SharedCanvas } from "@/components/design/projects/SharedCanvas";
import { ProjectsHero } from "@/components/design/projects/ProjectsHero";
import { HorizontalGallery } from "@/components/design/projects/HorizontalGallery";
import { ProjectList } from "@/components/design/projects/ProjectList";
import { ProjectModal } from "@/components/design/projects/ProjectModal";
import type { Project } from "@/payload-types";

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
      <SharedCanvas />

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
            onOpen={() => {}}
          />
        ) : (
          <ProjectList
            projects={filteredProjects}
            onOpen={() => {}}
          />
        )}
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

import { getAllProjects } from "@/lib/queries";
import { ProjectsPageClient } from "./ProjectsPageClient";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return <ProjectsPageClient projects={projects} />;
}

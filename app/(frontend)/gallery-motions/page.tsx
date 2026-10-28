import { getAllProjects } from "@/lib/queries";
import { ProjectsPageClient } from "./ProjectsPageClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return <ProjectsPageClient projects={projects} />;
}

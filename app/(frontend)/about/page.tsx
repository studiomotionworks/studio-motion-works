import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { FounderSection } from "@/components/about/FounderSection";
import { SantoorResonance } from "@/components/about/SantoorResonance";
import { Timeline } from "@/components/about/Timeline";
import { SpaceKinematics } from "@/components/about/SpaceKinematics";
import { NotableProjects } from "@/components/about/NotableProjects";
import { PhilosophyQuote } from "@/components/about/PhilosophyQuote";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { AboutCTA } from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "About — Studio Motionworks",
  description:
    "Studio Motionworks is a multidisciplinary kinetic art practice based in Ahmedabad, India. Founded by Anuj Anjaria.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <FounderSection />
      <SantoorResonance />
      <Timeline />
      {/* <SpaceKinematics /> */}
      <NotableProjects />
      <PhilosophyQuote />
      <ValuesGrid />
      <AboutCTA />
      
    </>
  );
}

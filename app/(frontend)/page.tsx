import { CTASection } from "@/components/design/CTASection";
import { FeaturedWorks } from "@/components/design/FeaturedWorks";
import { HeroSection } from "@/components/design/HeroSection";
import { StudioStorySection } from "@/components/sections/StudioStorySection";

export default function HomePage() {
  return (
    <div className="noise-overlay min-h-screen relative">
      <HeroSection />
      {/* <IntroSection /> */}
      <FeaturedWorks />
      <StudioStorySection />
      <CTASection />
    </div>
  );
}

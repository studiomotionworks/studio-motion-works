import type { Metadata } from "next";
import { EventsHero } from "@/components/events/EventsHero";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { UpcomingTimeline } from "@/components/events/UpcomingTimeline";
import { MotionBlurGallery } from "@/components/events/MotionBlurGallery";
import { upcomingEvents, pastEvents } from "@/data/events";
import { RsvpForm } from "@/components/events/RsvpForm";

export const metadata: Metadata = {
  title: "Events — Studio Motionworks",
  description:
    "Lectures, workshops, and premieres from Studio Motionworks. Where the studio meets an audience.",
};

export default function EventsPage() {
  const [featured, ...rest] = upcomingEvents;

  return (
    <>
      <EventsHero />
      <FeaturedEvent event={featured} />
      <UpcomingTimeline events={rest} />
      <MotionBlurGallery events={pastEvents} />
      <RsvpForm />
      <div className="h-16" />
    </>
  );
}
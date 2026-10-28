import type { Metadata } from "next";
import { EventsHero } from "@/components/events/EventsHero";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { UpcomingTimeline } from "@/components/events/UpcomingTimeline";
import { MotionBlurGallery } from "@/components/events/MotionBlurGallery";
import { RsvpForm } from "@/components/events/RsvpForm";
import { getAllEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — Studio Motionworks",
  description:
    "Lectures, workshops, and premieres from Studio Motionworks. Where the studio meets an audience.",
};

export default async function EventsPage() {
  const events = await getAllEvents();
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const pastEvents = events.filter((e) => e.status === "past");
  const [featured, ...rest] = upcomingEvents;

  return (
    <>
      <EventsHero />
      {featured && <FeaturedEvent event={featured} />}
      <UpcomingTimeline events={rest} />
      <MotionBlurGallery events={pastEvents} />
      <RsvpForm />
      <div className="h-16" />
    </>
  );
}

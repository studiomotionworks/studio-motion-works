"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Countdown } from "./Countdown";
import { CountdownIcon } from "./CountdownIcon";
import type { Event } from "@/data/events";

export function FeaturedEvent({ event }: { event: Event }) {
  const [urgency, setUrgency] = useState(0);

  return (
    <section className="relative px-6 pb-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-sm border border-border bg-surface"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-bronze/[0.08] blur-[120px]" />

          <div className="flex flex-col justify-center p-4 md:p-8">
            <div className="flex items-center gap-3">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-bronze"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze">
                Next Event
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full border px-3 py-1 font-body text-[9px] tracking-[0.3em] uppercase"
                style={{
                  borderColor: `${event.accent}40`,
                  color: event.accent,
                }}
              >
                {event.category}
              </span>
              {event.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 font-body text-[9px] tracking-[0.2em] uppercase text-ink-subtle"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="mt-6 font-display text-[clamp(1.6rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-tight text-ink">
              {event.title}
            </h2>

            <p className="mt-3 font-body text-base text-bronze md:text-lg">
              {event.subtitle}
            </p>

            <p className="mt-6 max-w-full font-body text-sm leading-[1.8] text-ink-muted">
              {event.longDescription || event.description}
            </p>

            {/* Venue & time */}
            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <span className="font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle">
                  When
                </span>
                <p className="mt-2 font-body text-sm text-ink">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {event.time && (
                  <p className="mt-1 font-body text-xs text-ink-muted">
                    {event.time}
                  </p>
                )}
              </div>
              <div>
                <span className="font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle">
                  Where
                </span>
                <p className="mt-2 font-body text-sm text-ink">{event.venue}</p>
                <p className="mt-1 font-body text-xs text-ink-muted">
                  {event.city}, {event.country}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-10 border-t border-border pt-8">
              <span className="mb-5 block font-body text-[10px] tracking-[0.4em] uppercase text-ink-subtle">
                Begins In
              </span>
              <Countdown target={event.date} onUrgency={setUrgency} />
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap gap-4">
              {event.rsvpUrl && (
                <Link
                  href={event.rsvpUrl}
                  data-magnetic
                  className="group relative overflow-hidden rounded-full border border-bronze/40 px-8 py-4 font-body text-[10px] tracking-[0.3em] uppercase text-bronze transition-colors duration-500 hover:text-void"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-bronze transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                  <span className="relative z-10">Reserve a Seat</span>
                </Link>
              )}
              {event.capacity && (
                <span className="flex items-center font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
                  {event.capacity}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

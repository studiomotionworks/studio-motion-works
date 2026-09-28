"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Event } from "@/payload-types";

import { useEffect, useState } from "react";

function InlineCountdown({ target }: { target: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Now");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      if (days > 0) setLabel(`${days}d ${hours}h`);
      else {
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setLabel(`${hours}h ${mins}m`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="font-body text-[10px] tabular-nums tracking-[0.2em] text-bronze">
      {label}
    </span>
  );
}

export function UpcomingTimeline({ events }: { events: Event[] }) {
  return (
    <section className="relative px-6 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze">
              Mark Your Calendar
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-tight text-ink">
              Upcoming
            </h2>
          </div>
          <span className="hidden h-px flex-1 bg-border mx-8 md:block" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
            {events.length} Events
          </span>
        </div>

        <div className="space-y-4">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={event.rsvpUrl || "#"}
                data-magnetic
                className="group relative block overflow-hidden rounded-sm border border-border bg-surface transition-colors duration-500 hover:border-bronze/30"
              >
                {/* Accent bar */}
                <span
                  className="absolute left-0 top-0 h-full w-0.5 transition-all duration-500 group-hover:w-1"
                  style={{ backgroundColor: event.accent ?? "" }}
                />

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8">
                  {/* Date block */}
                  <div className="flex items-center gap-5 md:flex-col md:items-start md:gap-1">
                    <div className="flex flex-col">
                      <span className="font-display text-2xl font-bold leading-none tracking-tight text-ink md:text-3xl">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          day: "2-digit",
                        })}
                      </span>
                      <span className="font-body text-[9px] tracking-[0.3em] uppercase text-bronze">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <span className="hidden font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle md:block">
                      {new Date(event.date).getFullYear()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full border px-2.5 py-0.5 font-body text-[8px] tracking-[0.3em] uppercase"
                        style={{
                          borderColor: `${event.accent}40`,
                          color: event.accent ?? "",
                        }}
                      >
                        {event.category}
                      </span>
                      <span className="font-body text-[9px] tracking-[0.2em] uppercase text-ink-subtle">
                        {event.city}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-bronze md:text-xl">
                      {event.title}
                    </h3>
                    <p className="mt-1.5 font-body text-xs text-ink-muted">
                      {event.venue}
                    </p>
                  </div>

                  {/* Right: countdown + arrow */}
                  <div className="flex items-center justify-between gap-6 md:justify-end">
                    <div className="flex flex-col items-end md:items-end">
                      <span className="font-body text-[8px] tracking-[0.3em] uppercase text-ink-subtle">
                        Starts In
                      </span>
                      <InlineCountdown target={event.date} />
                    </div>

                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 text-ink-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-bronze"
                    >
                      <path
                        d="M3 13L13 3M13 3H5M13 3V11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

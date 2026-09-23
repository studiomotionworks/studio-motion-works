"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelfDrawingField } from "@/components/contact/SelfDrawingField";
import { upcomingEvents } from "@/data/events";

export function RsvpForm() {
  const [eventId, setEventId] = useState(upcomingEvents[0].id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("1");
  const [state, setState] = useState<"idle" | "morphing" | "confirmed">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setState("morphing");
    await new Promise((r) => setTimeout(r, 1400));
    setState("confirmed");
    setTimeout(() => {
      setState("idle");
      setName("");
      setEmail("");
      setGuests("1");
    }, 3200);
  };

  const activeEvent = upcomingEvents.find((e) => e.id === eventId);

  return (
    <section id="rsvp" className="relative px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze">
            Reserve Your Place
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-ink">
            RSVP
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-ink-muted">
            {`Seats are limited. Reserve early, and we'll confirm within 24 hours.`}
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-sm border border-border bg-surface p-8 md:p-12"
        >
          {/* Corner ambient glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-bronze/[0.06] blur-[80px]" />

          {/* Event selector */}
          <div className="relative mb-10">
            <label className="mb-4 block font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
              Select Event
            </label>
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  data-magnetic
                  onClick={() => setEventId(event.id)}
                  className="group relative flex items-center gap-4 rounded-sm border border-border p-4 text-left transition-colors duration-300 hover:border-bronze/30"
                >
                  {/* Radio indicator */}
                  <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-border" />
                    {eventId === event.id && (
                      <motion.span
                        layoutId="rsvp-selected"
                        className="absolute inset-0 rounded-full border-2 border-bronze"
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    {eventId === event.id && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-1.5 w-1.5 rounded-full bg-bronze"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-body text-sm text-ink">{event.title}</p>
                    <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-ink-subtle">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {event.city}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="relative grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <SelfDrawingField
              label="Your Name"
              name="rsvp-name"
              value={name}
              onChange={setName}
              required
              placeholder="Ananya Sharma"
            />
            <SelfDrawingField
              label="Email"
              name="rsvp-email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="you@email.com"
            />
          </div>

          {/* Guest count */}
          <div className="relative mt-8">
            <label className="mb-3 block font-body text-[10px] tracking-[0.3em] uppercase text-ink-subtle">
              Number of Guests
            </label>
            <div className="flex gap-2">
              {["1", "2", "3", "4+"].map((n) => (
                <button
                  key={n}
                  type="button"
                  data-magnetic
                  onClick={() => setGuests(n)}
                  className="relative min-w-[52px] overflow-hidden rounded-sm border border-border px-4 py-2.5 font-body text-sm transition-colors duration-300"
                >
                  {guests === n && (
                    <motion.span
                      layoutId="guest-count"
                      className="absolute inset-0 bg-bronze"
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      guests === n ? "text-void" : "text-ink-muted"
                    }`}
                  >
                    {n}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit — morphing button */}
          <div className="relative mt-12 flex items-center justify-between gap-6 border-t border-border pt-8">
            <div className="max-w-xs">
              <p className="font-body text-[10px] leading-relaxed tracking-[0.05em] text-ink-subtle">
                {activeEvent?.capacity
                  ? `Limited capacity · ${activeEvent.capacity}`
                  : "Reserved seating available."}
              </p>
            </div>

            <MorphingSubmitButton state={state} disabled={!name || !email} />
          </div>
        </motion.form>
      </div>
    </section>
  );
}

function MorphingSubmitButton({
  state,
  disabled,
}: {
  state: "idle" | "morphing" | "confirmed";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="submit"
      data-magnetic
      disabled={disabled || state !== "idle"}
      whileHover={state === "idle" && !disabled ? { scale: 1.02 } : {}}
      whileTap={state === "idle" && !disabled ? { scale: 0.97 } : {}}
      className="group relative flex h-14 min-w-[180px] items-center justify-center overflow-hidden rounded-full border border-bronze/40 bg-transparent px-8 font-body text-[10px] tracking-[0.3em] uppercase text-bronze transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {/* Morphing shape layer — SVG drawn arc */}
      <AnimatePresence>
        {state === "morphing" && (
          <motion.svg
            key="morphing-arc"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 180 56"
            fill="none"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.path
              d="M 8,28 L 90,28 L 90,28 L 172,28"
              stroke="#C5A065"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: 1,
                d: [
                  "M 8,28 L 90,28 L 90,28 L 172,28",
                  "M 8,28 Q 90,-10 172,28",
                  "M 90,28 m -20,0 a 20,20 0 1,1 40,0 a 20,20 0 1,1 -40,0",
                ],
              }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {state === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              Reserve Seat
            </motion.span>
          )}
          {state === "morphing" && (
            <motion.span
              key="morphing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              Confirming…
            </motion.span>
          )}
          {state === "confirmed" && (
            <motion.span
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <motion.path
                  d="M2 7L6 11L12 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
              </svg>
              Reserved
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Confirmed background flash */}
      <AnimatePresence>
        {state === "confirmed" && (
          <motion.span
            key="confirmed-bg"
            className="absolute inset-0 bg-bronze"
            initial={{ scale: 0, borderRadius: "50%" }}
            animate={{ scale: 1, borderRadius: "9999px" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Text color override on confirmed */}
      {state === "confirmed" && (
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center font-body text-[10px] tracking-[0.3em] uppercase text-void">
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <motion.path
                d="M2 7L6 11L12 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              />
            </svg>
            Reserved
          </span>
        </span>
      )}
    </motion.button>
  );
}
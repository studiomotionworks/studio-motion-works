"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

function AnimatedDigit({ value, label }: { value: number; label: string }) {
  const formatted = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-16 w-14 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface md:h-20 md:w-16">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formatted}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute font-display text-3xl font-bold tabular-nums tracking-tight text-ink md:text-4xl"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>

        {/* Subtle bronze top-line accent */}
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />
      </div>
      <span className="mt-2 font-body text-[9px] tracking-[0.3em] uppercase text-ink-subtle">
        {label}
      </span>
    </div>
  );
}

export function Countdown({
  target,
  onUrgency,
}: {
  target: string;
  onUrgency?: (urgency: number) => void;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calcTimeLeft(target);
      setTimeLeft(next);
      // Urgency: 0 at 30+ days, 1 at <1 day
      const days = next.total / (1000 * 60 * 60 * 24);
      const urgency = Math.max(0, Math.min(1, 1 - days / 30));
      onUrgency?.(urgency);
    }, 1000);
    return () => clearInterval(interval);
  }, [target, onUrgency]);

  return (
    <div className="flex items-end gap-3 md:gap-4">
      <AnimatedDigit value={timeLeft.days} label="Days" />
      <span className="pb-8 font-display text-2xl font-bold text-bronze/40">:</span>
      <AnimatedDigit value={timeLeft.hours} label="Hours" />
      <span className="pb-8 font-display text-2xl font-bold text-bronze/40">:</span>
      <AnimatedDigit value={timeLeft.minutes} label="Min" />
      <span className="pb-8 font-display text-2xl font-bold text-bronze/40">:</span>
      <AnimatedDigit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
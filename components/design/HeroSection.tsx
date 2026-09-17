"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KineticText } from "@/components/ui/KineticText";
import { MorphButton } from "@/components/ui/MorphButton";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scale and round the video container on scroll
      gsap.to(videoRef.current, {
        scale: 0.85,
        borderRadius: "32px",
        opacity: 0.6,
        y: 50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Text elements move up faster than scroll
      gsap.to(headlineRef.current, {
        yPercent: -40,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(subRef.current, {
        yPercent: -20,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "40% top",
          scrub: 1,
        },
      });

      gsap.to(ctaRef.current, {
        yPercent: -10,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "30% top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void"
    >
      {/* Scroll-animated video background */}
      <div
        ref={videoRef}
        className="absolute inset-0 z-0 origin-center overflow-hidden"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="https://ky7bb3jva0qgai9o.public.blob.vercel-storage.com/output.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-void/50" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-3"
      >
        <span className="font-body text-[9px] tracking-[0.4em] uppercase text-mist/50">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-bronze/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { KineticText } from "@/components/ui/KineticText";

gsap.registerPlugin(ScrollTrigger);

export function StudioStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Founder photo eases in and settles as it enters view
      gsap.fromTo(
        photoRef.current,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: photoRef.current,
            start: "top 85%",
            end: "top 40%",
            scrub: 1.2,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative px-6 py-32 md:py-48">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="font-body text-[10px] tracking-[0.4em] uppercase text-bronze/60">
          The Studio
        </span>

        <KineticText
          text="MOTION AS MATERIAL"
          as="h2"
          className="mt-6 font-display text-[clamp(1.8rem,4.5vw,3.5rem)] font-bold leading-[1] tracking-tight text-offwhite"
          staggerDelay={0.05}
        />

        <p className="mt-8 max-w-xl font-body text-sm leading-relaxed text-mist md:text-base">
          Studio Motionworks is a contemporary design studio exploring the art
          of movement, creating bespoke kinetic sculptures, lighting, and
          spatial experiences.
        </p>

        <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-mist md:text-base">
          Blending refined craftsmanship, engineering, and artistic expression,
          the studio&apos;s work is conceived as a statement, quietly
          transforming space and emotion through motion.
        </p>

        {/* <a
          href="#"
          data-magnetic
          className="mt-10 font-body text-xs tracking-[0.2em] uppercase text-offwhite/70 transition-colors hover:text-bronze"
        >
          Meet the Founder →
        </a> */}
      </div>

      {/* Founder photo */}
      <div
        ref={photoRef}
        className="relative mx-auto mt-20 aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm bg-gunmetal md:aspect-[16/10]"
      >
        {/*
          Replace the src below with the uploaded founder photo,
          e.g. "/images/founder.jpg" once it's added to /public/images.
        */}
        <Image
          src="/founder.jpeg"
          alt="Founder of Studio Motionworks"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 28rem, 100vw"
        />

        {/* Bronze overlay tint, matching IntroSection's video treatment */}
        <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/10" />

        {/* Corner label */}
        <div className="absolute bottom-4 left-4">
          <span className="font-body text-[9px] tracking-[0.3em] uppercase text-bronze/80">
            Founder
          </span>
        </div>
      </div>
    </section>
  );
}

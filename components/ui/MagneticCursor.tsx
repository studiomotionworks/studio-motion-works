"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isOnCanvas, setIsOnCanvas] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const springConfig = { stiffness: 400, damping: 28, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Update CSS custom properties for the radial gradient
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${e.clientX}px`
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        `${e.clientY}px`
      );
    };

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        !!target.closest(
          "a, button, [data-magnetic], input, textarea, [role='button']"
        )
      );
      setIsOnCanvas(!!target.closest("canvas"));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      ref={cursorRef}
      className="hidden md:flex pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={{
          width: isHovering ? 64 : isOnCanvas ? 40 : 12,
          height: isHovering ? 64 : isOnCanvas ? 40 : 12,
          opacity: isHovering ? 0.6 : isOnCanvas ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="rounded-full bg-bronze"
        style={{
          boxShadow: isHovering
            ? "0 0 40px 8px rgba(197,160,101,0.35)"
            : "0 0 20px 4px rgba(197,160,101,0.2)",
        }}
      />
    </motion.div>
  );
}
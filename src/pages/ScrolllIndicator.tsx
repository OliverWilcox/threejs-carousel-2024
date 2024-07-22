import * as THREE from "three";
import React, { useRef, useMemo, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function Indicator() {
  const linesRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let previousProgress = 0;

    const tl = gsap.timeline();

    linesRef.current.forEach((line, index) => {
      tl.to(line, { width: "8px" }, index * 0.08); // Increase stagger time
      tl.to(line, { opacity: "1" }, index * 0.08); // Increase stagger time
    });
    ScrollTrigger.create({
      start: "top top",

      scrub: true,

      animation: tl,
      onUpdate: (self) => {
        const currentProgress = self.progress;
        previousProgress = currentProgress;
      },
    });

    gsap.to(containerRef.current, {
      right: "10px",
      scrollTrigger: {
        start: "top top",

        //markers: true,
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <div
      className="w-1 z-40 fixed right-7 top-1/2 transform -translate-y-1/2"
      ref={containerRef}
    >
      {Array.from({ length: 36 }).map((_, i) => (
        <div
          key={i}
          className="h-px bg-white mt-1 relative left-1/2 transform -translate-x-1/2 opacity-20"
          ref={(el) => el && (linesRef.current[i] = el)}
        ></div>
      ))}
    </div>
  );
}

export default Indicator;

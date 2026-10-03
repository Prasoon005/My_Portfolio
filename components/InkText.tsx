"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/media";

/**
 * A paragraph that inks in word by word as it's scrolled through, like
 * a line being read. CSS turns --p (0 … 1) into each word's opacity.
 */
export default function InkText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty("--p", "1");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "bottom 45%",
      onUpdate: (self) => el.style.setProperty("--p", self.progress.toFixed(4)),
    });
    return () => trigger.kill();
  }, []);

  return (
    <p ref={ref} className={`ink-text ${className}`} style={{ "--n": words.length } as CSSProperties}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="ink-word" style={{ "--i": i } as CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

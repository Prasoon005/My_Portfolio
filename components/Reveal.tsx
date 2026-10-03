"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds. */
  delay?: number;
  style?: CSSProperties;
}

/** Matches the longest `.reveal` transition in globals.css. */
const ENTRANCE_MS = 800;

/** Pops its children up the first time they scroll into view. */
export default function Reveal({ children, className = "", delay = 0, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-in", "");
        // Once the entrance has played, CSS swaps to the quicker hover transitions.
        done = window.setTimeout(() => el.setAttribute("data-done", ""), delay + ENTRANCE_MS);
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(done);
    };
  }, [delay]);

  const merged = delay ? ({ ...style, "--d": `${delay}ms` } as CSSProperties) : style;

  return (
    <div ref={ref} className={`reveal ${className}`} style={merged}>
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/media";

const DURATION = 1600;

/**
 * Counts the leading number of `value` up the first time it scrolls into
 * view ("600+" runs 0 → 600, keeping the "+"). Years count only their last
 * few steps, so 2027 rolls in from 2019 rather than from zero.
 */
export default function CountUp({ value }: { value: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const from = target > 1900 ? target - 8 : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!match || !el || prefersReducedMotion()) return;
    setN(from);
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          const eased = 1 - Math.pow(1 - t, 4);
          setN(Math.round(from + (target - from) * eased));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  if (!match) return <span>{value}</span>;
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden className="tabular-nums">
        {n}
        {suffix}
      </span>
    </span>
  );
}

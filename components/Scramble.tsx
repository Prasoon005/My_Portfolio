"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/media";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz/<>{}*+=_#";
const DURATION = 520;

interface Props {
  text: string;
  /** Bump to replay the effect on unchanged text, e.g. on hover. */
  replay?: number;
  className?: string;
}

/**
 * Settles into `text` left to right through a flicker of random glyphs,
 * whenever the text changes or `replay` bumps. Screen readers get the
 * final text only.
 */
export default function Scramble({ text, replay = 0, className }: Props) {
  const [shown, setShown] = useState(text);
  const first = useRef(true);

  useEffect(() => {
    if (first.current || prefersReducedMotion()) {
      first.current = false;
      setShown(text);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const settled = Math.floor(t * text.length);
      setShown(
        Array.from(text, (ch, i) =>
          i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        ).join(""),
      );
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, replay]);

  return (
    <span className={className}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

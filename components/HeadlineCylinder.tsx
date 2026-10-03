"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useHeroProgress } from "@/lib/hero-progress";
import { clamp, smootherstep } from "@/lib/math";

export interface Beat {
  lead: string;
  tail: string;
}

export interface CylinderHandle {
  /** Re-reads the shared eased progress and repositions every face. */
  update: () => void;
}

/** Share of the scroll each roll takes; the rest is reading time. */
const ROLL_WINDOW = 0.2;
const STEP_DEG = 90;

/** 0 → beats.length - 1, holding still on each beat between rolls. */
function phaseFor(progress: number, beats: number) {
  if (beats < 2) return 0;
  let phase = 0;
  for (let j = 0; j < beats - 1; j++) {
    const center = (j + 1) / beats;
    phase += smootherstep(center - ROLL_WINDOW / 2, center + ROLL_WINDOW / 2, progress);
  }
  return phase;
}

interface Props {
  beats: Beat[];
  className?: string;
}

/**
 * Each beat is a face of a square drum whose axis runs left to right.
 * Faces sit 90° apart, so a beat at rest has its neighbours edge-on
 * (invisible) and every change is a physical roll upward, not a fade.
 */
const HeadlineCylinder = forwardRef<CylinderHandle, Props>(function HeadlineCylinder({ beats, className }, ref) {
  const progress = useHeroProgress();
  const drumRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const radius = useRef(0);
  const lastPhase = useRef(Number.NaN);

  const render = useCallback((phase: number) => {
    const r = radius.current;
    faceRefs.current.forEach((face, i) => {
      if (!face) return;
      const d = i - phase;
      if (Math.abs(d) >= 0.999) {
        if (face.style.visibility !== "hidden") face.style.visibility = "hidden";
        return;
      }
      const angle = d * STEP_DEG;
      const rad = (angle * Math.PI) / 180;
      const y = r * Math.sin(rad);
      const z = r * Math.cos(rad) - r;
      face.style.visibility = "visible";
      face.style.transform =
        `perspective(1200px) translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${(-angle).toFixed(3)}deg)`;
    });
  }, []);

  const update = useCallback(() => {
    const phase = phaseFor(clamp(progress.current ?? 0), beats.length);
    if (Math.abs(phase - lastPhase.current) < 1e-4) return;
    lastPhase.current = phase;
    render(phase);
  }, [beats.length, progress, render]);

  useImperativeHandle(ref, () => ({ update }), [update]);

  useEffect(() => {
    const drum = drumRef.current;
    if (!drum) return;
    const measure = () => {
      radius.current = drum.offsetHeight / 2; // a face is exactly one drum-height tall
      lastPhase.current = Number.NaN;
      update();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(drum);
    return () => ro.disconnect();
  }, [update]);

  return (
    <div className={className}>
      <div ref={drumRef} aria-hidden className="relative h-[2.14em]">
        {beats.map((beat, i) => (
          <div
            key={beat.lead}
            ref={(el) => {
              faceRefs.current[i] = el;
            }}
            className="headline-face absolute inset-0 flex flex-col justify-center whitespace-nowrap"
            style={i === 0 ? undefined : { visibility: "hidden" }}
          >
            <span className="block font-medium">{beat.lead}</span>
            <span className="block font-serif text-[1.12em] leading-[0.95] tracking-[-0.012em] italic">{beat.tail}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default HeadlineCylinder;

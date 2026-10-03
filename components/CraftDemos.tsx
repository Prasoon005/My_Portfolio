"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Reveal from "@/components/Reveal";

function Demo({ index, title, note, children }: { index: number; title: string; note: string; children: ReactNode }) {
  return (
    <Reveal delay={70 * index} className="panel flex h-full flex-col p-6">
      <div className="demo-stage">{children}</div>
      <h4 className="mt-5 text-[16px] font-medium tracking-[-0.015em]">{title}</h4>
      <p className="mt-1 text-[14px] leading-snug text-graphite">{note}</p>
    </Reveal>
  );
}

/** Same distance, same time: one moves, the other arrives. */
function Easing() {
  const [played, setPlayed] = useState(false);
  return (
    <button
      type="button"
      className="easing w-full"
      data-played={played || undefined}
      onClick={() => setPlayed((p) => !p)}
      onPointerEnter={() => setPlayed(true)}
      onPointerLeave={() => setPlayed(false)}
      aria-label="Play the easing comparison"
    >
      {["linear", "ease-out"].map((curve) => (
        <span key={curve} className="easing-row">
          <span className="easing-name">{curve}</span>
          <span className="easing-track">
            <span className="easing-ball" data-curve={curve} />
          </span>
        </span>
      ))}
    </button>
  );
}

type Phase = "idle" | "busy" | "done";

/** Idle, working, done: every state is visible. */
function Feedback() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase === "idle") return;
    const timer = window.setTimeout(() => setPhase(phase === "busy" ? "done" : "idle"), phase === "busy" ? 1300 : 1700);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <div className="grid h-full place-items-center">
      <button
        type="button"
        className="morph-button"
        data-phase={phase}
        onClick={() => phase === "idle" && setPhase("busy")}
        aria-live="polite"
      >
        {phase === "idle" && "Send message"}
        {phase === "busy" && (
          <span className="spinner" role="img" aria-label="Sending" />
        )}
        {phase === "done" && "Sent ✓"}
      </button>
    </div>
  );
}

const PAPER = [244, 244, 242];

const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Drag the grey; the WCAG contrast ratio against the paper is measured live. */
function Contrast() {
  const [level, setLevel] = useState(85);
  const grey = Math.round(20 + (level / 100) * 205);
  const ratio = (luminance(PAPER) + 0.05) / (luminance([grey, grey, grey]) + 0.05);
  const grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "Fail";

  return (
    <div className="contrast" style={{ "--grey": `rgb(${grey} ${grey} ${grey})` } as CSSProperties}>
      <div className="contrast-sample">
        <span className="contrast-text">Readable for everyone</span>
        <span className="flex items-center gap-2 text-[12px] tabular-nums">
          {ratio.toFixed(2)}:1
          <span className="contrast-grade" data-fail={grade === "Fail" || undefined}>
            {grade}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="contrast-range"
        aria-label="Text lightness"
        aria-valuetext={`${ratio.toFixed(2)} to 1, ${grade}`}
      />
    </div>
  );
}

const densities = [
  { name: "Tight", unit: 4 },
  { name: "Balanced", unit: 12 },
  { name: "Airy", unit: 22 },
];

/** One spacing unit drives every gap and margin, so the layout stays in proportion. */
function Density() {
  const [pick, setPick] = useState(1);
  return (
    <div className="flex h-full flex-col gap-3" style={{ "--unit": `${densities[pick].unit}px` } as CSSProperties}>
      <div className="segmented" role="radiogroup" aria-label="Density" style={{ "--pick": pick } as CSSProperties}>
        <span aria-hidden className="segmented-thumb" />
        {densities.map((d, i) => (
          <button
            key={d.name}
            type="button"
            role="radio"
            aria-checked={pick === i}
            onClick={() => setPick(i)}
          >
            {d.name}
          </button>
        ))}
      </div>
      <div className="density-card">
        <i className="w-2/3" />
        <i className="w-full" />
        <i className="w-5/6" />
        <i className="density-cta" />
      </div>
    </div>
  );
}

export default function CraftDemos() {
  return (
    <div className="mt-20">
      <Reveal>
        <p className="eyebrow">
          <span aria-hidden className="eyebrow-rule" />
          How I design. Try them.
        </p>
      </Reveal>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <Demo index={0} title="Motion that explains" note="Same distance, same time. One moves, one arrives.">
            <Easing />
          </Demo>
        </li>
        <li>
          <Demo index={1} title="Feedback at every step" note="Nobody should wonder whether it worked.">
            <Feedback />
          </Demo>
        </li>
        <li>
          <Demo index={2} title="Readable for everyone" note="Drag it. WCAG contrast, measured live.">
            <Contrast />
          </Demo>
        </li>
        <li>
          <Demo index={3} title="Space does the work" note="One spacing unit, and the layout keeps its proportions.">
            <Density />
          </Demo>
        </li>
      </ul>
    </div>
  );
}

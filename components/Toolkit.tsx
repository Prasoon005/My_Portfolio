"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import Scramble from "@/components/Scramble";
import SectionHeading from "@/components/SectionHeading";
import { certifications, toolkit } from "@/lib/content";
import { scrollToTarget } from "@/lib/lenis-store";
import { prefersReducedMotion } from "@/lib/media";
import { setToolFilter, usedIn } from "@/lib/tools";

/** A small typographic mark per group. */
const glyphs: Record<string, string> = {
  Languages: "</>",
  Frontend: "◐",
  Backend: "{ }",
  Databases: "◫",
  "AI and LLMs": "✦",
  Tools: "⌘",
  Fundamentals: "∑",
};

const allTools = toolkit.flatMap((row) => row.items);

/** Pixels per frame at rest, and the most a hard scroll can add. */
const BASE_SPEED = 0.55;
const MAX_BOOST = 14;

/**
 * A row of every tool that drifts on its own, races when the page is
 * scrolled, runs backward when scrolling up, and leans into the motion.
 * Hovering it slows it to a stop.
 */
function Marquee({ reverse = false }: { reverse?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const items = reverse ? [...allTools].reverse() : allTools;

  useEffect(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    if (!row || !track || prefersReducedMotion()) return;

    const heading = reverse ? 1 : -1;
    let x = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    let scrollDir = 1;
    let speed = BASE_SPEED;
    let hovered = false;
    let frame = 0;

    const tick = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      velocity += (dy - velocity) * 0.12;
      if (Math.abs(dy) > 0.5) scrollDir = Math.sign(dy);

      const goal = hovered ? 0 : BASE_SPEED + Math.min(Math.abs(velocity) * 0.4, MAX_BOOST);
      speed += (goal - speed) * 0.08;
      x += heading * scrollDir * speed;

      // The track holds two identical copies, so wrapping by half is seamless.
      const half = track.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;

      const skew = Math.max(-10, Math.min(10, velocity * -0.25));
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      frame = requestAnimationFrame(tick);
    };

    // Only animate while the row is on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        lastY = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(row);
    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
    };
  }, [reverse]);

  return (
    <div ref={rowRef} className={`marquee ${reverse ? "marquee-outline" : "marquee-solid"}`} aria-hidden>
      <div ref={trackRef} className="marquee-track">
        {[0, 1].map((copy) =>
          items.map((item, i) => (
            <span
              key={`${copy}-${item}`}
              className={`marquee-item ${i % 2 ? "font-serif italic" : "font-medium tracking-[-0.035em]"}`}
            >
              {item}
              <span className="marquee-sep" />
            </span>
          )),
        )}
      </div>
    </div>
  );
}

function ToolCard({ group, items, index }: { group: string; items: string[]; index: number }) {
  const [active, setActive] = useState<string | null>(null);
  const [replay, setReplay] = useState(0);
  const shipped = active ? usedIn(active) : [];

  const readout = !active
    ? "Hover a tool"
    : shipped.length
      ? `Shipped in ${shipped.join(" / ")}. Click to see`
      : "Practised and studied, beyond these projects";

  const showWork = (tool: string) => {
    if (!usedIn(tool).length) return;
    setToolFilter(tool);
    scrollToTarget("#work");
  };

  return (
    <Reveal
      delay={60 * (index % 3)}
      className="panel tilt flex w-full flex-col p-6 md:p-7"
    >
      <div className="flex items-center justify-between gap-4" onPointerEnter={() => setReplay((n) => n + 1)}>
        <div className="flex items-center gap-3">
          <span aria-hidden className="tool-glyph">
            {glyphs[group] ?? "•"}
          </span>
          <h3 className="text-[13px] tracking-[0.12em] text-graphite uppercase">
            <Scramble text={group} replay={replay} />
          </h3>
        </div>
        <span className="font-serif text-2xl text-graphite italic tabular-nums">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      <ul className="chip-set mt-5 flex flex-wrap gap-2">
        {items.map((item) => {
          const linked = usedIn(item).length > 0;
          return (
            <li key={item}>
              <button
                type="button"
                className="chip"
                data-active={active === item || undefined}
                data-cursor={linked ? "See work" : undefined}
                aria-disabled={!linked || undefined}
                onClick={() => showWork(item)}
                onPointerEnter={() => setActive(item)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(item)}
                onBlur={() => setActive(null)}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ul>

      <p
        className={`tool-readout mt-auto pt-6 text-[13.5px] leading-snug ${active ? "" : "text-graphite"}`}
        aria-live="polite"
      >
        <Scramble text={readout} />
        {!active && <span aria-hidden> ↗</span>}
      </p>
    </Reveal>
  );
}

export default function Toolkit() {
  return (
    <section id="toolkit" className="section overflow-x-clip">
      <div className="wrap">
        <SectionHeading index="04" label="Toolkit" lead="What I" tail="build with.">
          Hover a tool to see where it shipped. Click it to see the work.
        </SectionHeading>
      </div>

      <div className="mt-14 space-y-1 md:space-y-2">
        <Marquee />
        <Marquee reverse />
      </div>

      <div className="wrap">
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {toolkit.map((row, i) => (
            <li key={row.group} className="flex">
              <ToolCard group={row.group} items={row.items} index={i} />
            </li>
          ))}

          <li className="flex sm:col-span-2">
            <Reveal delay={60} className="panel tilt-soft w-full p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[13px] tracking-[0.12em] text-graphite uppercase">Certifications</h3>
                <span className="font-serif text-2xl text-graphite italic tabular-nums">
                  {String(certifications.length).padStart(2, "0")}
                </span>
              </div>
              <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {certifications.map((cert) => (
                  <li key={`${cert.name}-${cert.issuer}`} className="cert border-t border-ink/12 pt-3">
                    <p className="text-[16px] leading-snug font-medium tracking-[-0.01em]">
                      {cert.name} <span className="cert-arrow">→</span>
                    </p>
                    <p className="mt-0.5 text-sm text-graphite">{cert.issuer}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        </ul>
      </div>
    </section>
  );
}

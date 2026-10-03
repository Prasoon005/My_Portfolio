"use client";

import { useEffect, useState } from "react";
import Scramble from "@/components/Scramble";
import { scrollToTarget } from "@/lib/lenis-store";

const sections = [
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "work", label: "Work" },
  { id: "toolkit", label: "Toolkit" },
  { id: "contact", label: "Contact" },
];

/**
 * Bottom-left reading position: "02 / 05 Journey", with one tick per
 * section to jump between them. Hidden over the hero.
 */
export default function SectionRail() {
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    // A thin band across the middle of the window decides which section is "current".
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(sections.findIndex((s) => s.id === entry.target.id));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      if (els[0] && els[0].getBoundingClientRect().top > window.innerHeight / 2) setCurrent(-1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const section = sections[current];

  return (
    <nav aria-label="Sections" className="section-rail" data-shown={section ? "" : undefined}>
      <p className="flex items-baseline gap-2 text-[12px] tracking-[0.14em] uppercase">
        <span className="tabular-nums">{String(Math.max(current, 0) + 1).padStart(2, "0")}</span>
        <span className="text-graphite tabular-nums">/ {String(sections.length).padStart(2, "0")}</span>
        <Scramble text={section?.label ?? ""} className="ml-2" />
      </p>
      <ul className="mt-3 flex gap-1.5">
        {sections.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              aria-label={`Go to ${s.label}`}
              aria-current={i === current || undefined}
              className="rail-tick"
              onClick={() => scrollToTarget(`#${s.id}`)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

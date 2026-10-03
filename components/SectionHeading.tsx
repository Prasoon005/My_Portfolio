import type { CSSProperties, ReactNode } from "react";
import Reveal from "@/components/Reveal";

interface Props {
  index: string;
  label: string;
  /** Set in the sans face; `tail` follows in Instrument Serif, like the hero headlines. */
  lead: string;
  tail: string;
  children?: ReactNode;
}

export default function SectionHeading({ index, label, lead, tail, children }: Props) {
  const words = tail.split(" ");
  // Running letter index at the start of each word, for a continuous ripple.
  const starts = words.map((_, w) => words.slice(0, w).join("").length);

  return (
    <Reveal className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
      <div className="md:col-span-7">
        <p className="eyebrow">
          <span className="tabular-nums">{index}</span>
          <span aria-hidden className="eyebrow-rule" />
          {label}
        </p>
        <h2 className="section-title mt-5">
          {lead}{" "}
          <span className="font-serif text-[1.12em] font-normal tracking-[-0.012em] italic">
            <span className="sr-only">{tail}</span>
            {words.map((word, w) => (
              <span key={w} aria-hidden>
                {w > 0 && " "}
                <span className="tail">
                  {/* One span per letter, so the hover ripple can stagger. */}
                  {Array.from(word, (ch, i) => (
                    <span key={i} className="tail-char" style={{ "--i": starts[w] + i } as CSSProperties}>
                      {ch}
                    </span>
                  ))}
                  {/* Hand-drawn stroke under the last word, inked in as the heading scrolls into view. */}
                  {w === words.length - 1 && (
                    <svg className="scribble" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <path pathLength={1} d="M2 8.5C30 4 62 3.2 96 5.6c26 1.8 52 2.6 72 0.8 10-0.9 19-2.4 30-4.4" />
                    </svg>
                  )}
                </span>
              </span>
            ))}
          </span>
        </h2>
      </div>
      {children && (
        <p className="max-w-[46ch] text-[17px] leading-relaxed text-graphite md:col-span-5 md:pb-1.5">{children}</p>
      )}
    </Reveal>
  );
}

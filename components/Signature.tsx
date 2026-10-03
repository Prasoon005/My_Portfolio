import type { CSSProperties } from "react";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/content";

/** The name set edge to edge across the foot of the page; letters rise in, and lift under the cursor. */
export default function Signature() {
  const [first, ...rest] = site.name.split(" ");
  const words = [first, rest.join(" ")];
  // Running letter index at the start of each word, for one continuous stagger.
  const starts = [0, first.length];

  return (
    <div aria-hidden className="wrap">
      <Reveal className="signature">
        {words.map((word, w) => (
          <span key={w} className={`signature-word ${w ? "font-serif font-normal italic" : ""}`}>
            {Array.from(word, (ch, i) => (
              <span key={i} className="signature-mask">
                <span className="signature-char" style={{ "--i": starts[w] + i } as CSSProperties}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
        ))}
      </Reveal>
    </div>
  );
}

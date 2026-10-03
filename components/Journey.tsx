"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { journey } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/media";

export default function Journey() {
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // The rule fills as you read down the timeline: scroll is time here too.
  // Each milestone's dot is inked once the rule reaches it.
  useEffect(() => {
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line) return;
    const steps = Array.from(list.children) as HTMLElement[];
    if (prefersReducedMotion()) {
      line.style.setProperty("--p", "1");
      steps.forEach((step) => step.setAttribute("data-lit", ""));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const triggers = [
      ScrollTrigger.create({
        trigger: list,
        start: "top 75%",
        end: "bottom 65%",
        onUpdate: (self) => line.style.setProperty("--p", self.progress.toFixed(4)),
      }),
      ...steps.map((step) =>
        ScrollTrigger.create({
          trigger: step,
          start: "top 70%",
          end: "max",
          onEnter: () => step.setAttribute("data-lit", ""),
          onLeaveBack: () => step.removeAttribute("data-lit"),
        }),
      ),
    ];
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section id="journey" className="section">
      <div className="wrap">
        <SectionHeading index="02" label="Journey" lead="How I" tail="got here.">
          From a first semester of C to apps with models inside.
        </SectionHeading>

        <div className="relative mt-14">
          <div ref={lineRef} aria-hidden className="journey-line absolute bg-ink/12">
            <span className="block h-full w-full bg-ink" />
          </div>
          <ol ref={listRef} className="space-y-5">
            {journey.map((step, i) => (
              <li key={step.title} className="journey-step relative pl-9 md:pl-14">
                <span aria-hidden className="journey-dot absolute top-9 left-0 md:top-11" />
                <Reveal className="panel flood tilt-soft grid gap-3 overflow-hidden p-6 md:grid-cols-12 md:gap-10 md:p-8">
                  <span aria-hidden className="ghost-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-serif text-[1.75rem] leading-none italic md:col-span-3">{step.period}</p>
                  <div className="md:col-span-9">
                    <h3 className="text-xl leading-snug font-medium tracking-[-0.015em]">
                      <span className="sweep">{step.title}</span>
                    </h3>
                    <p className="mt-2 max-w-[62ch] text-[15.5px] leading-relaxed text-graphite">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import ProjectMock from "@/components/ProjectMock";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { projects } from "@/lib/content";
import { onToolFilter, projectUses, sameTool, setToolFilter } from "@/lib/tools";

/** Preview card size, in px, for keeping it inside the window. */
const PREVIEW_W = 352;
const PREVIEW_H = 240;

/**
 * The projects as an editorial index. Hovering a row floats a live
 * blueprint of that product beside the cursor; clicking opens the case
 * study in place. The Toolkit (or command palette) can filter it by tool.
 */
export default function Work() {
  const [tool, setTool] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [hover, setHover] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // A filter from elsewhere: open the first project built with that tool.
  useEffect(
    () =>
      onToolFilter((next) => {
        setTool(next);
        if (next) setOpen(projects.findIndex((p) => projectUses(p, next)));
      }),
    [],
  );

  // The preview eases after the cursor and leans with its horizontal speed.
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let px = 0;
    let py = 0;
    let frame = 0;
    let started = false;

    const tick = () => {
      const dx = x - px;
      px += dx * 0.14;
      py += (y - py) * 0.14;
      const lean = Math.max(-12, Math.min(12, dx * 0.08));
      preview.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg)`;
      frame = Math.abs(dx) + Math.abs(y - py) > 0.2 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (event: PointerEvent) => {
      // Beside the cursor, kept inside the window.
      x = Math.min(event.clientX + 28, window.innerWidth - PREVIEW_W - 16);
      y = Math.max(16, Math.min(event.clientY - PREVIEW_H / 2, window.innerHeight - PREVIEW_H - 16));
      if (!started) {
        px = x;
        py = y;
        started = true;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const matching = tool ? projects.filter((p) => projectUses(p, tool)).length : projects.length;
  const previewing = hover !== null && hover !== open;

  return (
    <section id="work" className="section">
      <div className="wrap">
        <SectionHeading index="03" label="Work" lead="Selected" tail="projects.">
          Four products, schema to screen. Hover for a look, click for the story.
        </SectionHeading>

        <div className="work-filter mt-10" data-shown={tool ? "" : undefined} aria-live="polite">
          {tool && (
            <p className="flex flex-wrap items-center gap-3 text-[15px]">
              <span className="text-graphite">Built with</span>
              <span className="chip" data-active>
                {tool}
              </span>
              <span className="text-graphite tabular-nums">
                {matching} of {projects.length}
              </span>
              <button
                type="button"
                onClick={() => setToolFilter(null)}
                className="ml-1 underline decoration-ink/30 underline-offset-[5px] transition-colors hover:decoration-ink"
              >
                Show all
              </button>
            </p>
          )}
        </div>

        <ol className="work-index mt-6" onPointerLeave={() => setHover(null)}>
          {projects.map((project, i) => {
            const isOpen = open === i;
            const dimmed = !!tool && !projectUses(project, tool);
            return (
              <li
                key={project.name}
                className="work-row"
                data-open={isOpen || undefined}
                data-dimmed={dimmed || undefined}
                data-hover={hover === i || undefined}
              >
                <Reveal delay={70 * i}>
                  <button
                    type="button"
                    className="work-head"
                    aria-expanded={isOpen}
                    aria-controls={`case-${i}`}
                    data-cursor={isOpen ? "Close" : "Open"}
                    onClick={() => setOpen(isOpen ? null : i)}
                    onPointerEnter={() => setHover(i)}
                  >
                    <span className="work-num font-serif italic tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="work-name">{project.name}</span>
                    <span className="work-meta">
                      {i === 0 && <span className="chip">Featured</span>}
                      <span className="hidden text-graphite md:inline">{project.category}</span>
                      <span aria-hidden className="work-toggle" />
                    </span>
                  </button>
                </Reveal>

                <div id={`case-${i}`} className="case" role="region" aria-label={project.name}>
                  <div className="case-inner">
                    <div className="grid gap-8 pt-2 pb-12 lg:grid-cols-12 lg:gap-12">
                      <div className="case-shot lg:col-span-6">
                        <ProjectMock project={project} live={isOpen} />
                      </div>

                      <div className="flex flex-col lg:col-span-6">
                        <p className="font-serif text-[clamp(1.4rem,2vw,1.75rem)] leading-[1.2] italic">
                          {project.summary}
                        </p>
                        <ol className="case-points mt-7 space-y-3 border-t border-ink/12 pt-6 text-[15.5px] leading-relaxed">
                          {project.highlights.map((point, n) => (
                            <li key={point} className="grid grid-cols-[2rem_1fr]">
                              <span className="text-[12px] text-graphite tabular-nums">
                                {String(n + 1).padStart(2, "0")}
                              </span>
                              {point}
                            </li>
                          ))}
                        </ol>
                        <ul className="mt-7 flex flex-wrap gap-2">
                          {project.stack.map((tech) => (
                            <li key={tech} className="chip" data-active={(tool && sameTool(tech, tool)) || undefined}>
                              {tech}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8">
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="Code"
                            className="cta magnetic inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium"
                          >
                            {project.linkLabel}
                            <span aria-hidden>↗</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Floating blueprint that trails the cursor over the index. */}
      <div ref={previewRef} aria-hidden className="work-preview" data-shown={previewing || undefined}>
        {projects.map((project, i) => (
          <div key={project.name} className="work-preview-slide" data-on={hover === i || undefined}>
            <ProjectMock project={project} live={hover === i} />
          </div>
        ))}
      </div>
    </section>
  );
}

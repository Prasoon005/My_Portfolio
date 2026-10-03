"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import HeadlineCylinder, { type CylinderHandle } from "@/components/HeadlineCylinder";
import Scrims from "@/components/Scrims";
import { drawCover, sampleBackdrop } from "@/lib/canvas";
import { headlines } from "@/lib/content";
import { fetchManifest, loadImage, preloadRemaining, type FrameSlot } from "@/lib/frames";
import { HeroProgressContext } from "@/lib/hero-progress";
import { clamp, smoothstep } from "@/lib/math";
import { isStaticEnvironment } from "@/lib/media";

type Mode = "pending" | "static" | "sequence";

const LERP = 0.2;
const SNAP = 0.001;
const MAX_DPR = 2;
/** The floating-sculpture tilt is gone by the time the playhead reaches this frame. */
const TILT_FADE_FRAMES = 4;
const TILT_EASE = 0.07;

function applyBackdrop(img: HTMLImageElement) {
  const color = sampleBackdrop(img);
  if (color) document.documentElement.style.setProperty("--stage", color);
}

interface Props {
  /** Versioned URL of the first frame, or null while no frames are extracted. */
  poster: string | null;
}

export default function Hero({ poster }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sculptRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderBarRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const cylinderRef = useRef<CylinderHandle>(null);
  /** Shared eased progress (0 → 1) for everything synced to the sequence. */
  const progressRef = useRef(0);
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    setMode(isStaticEnvironment() ? "static" : "sequence");
  }, []);

  // frame_0001 is server-rendered as a plain image, so it paints before any JS
  // runs. Its corners set the page colour so nothing around it ever flashes.
  const handlePosterLoad = useCallback(() => {
    if (posterRef.current) applyBackdrop(posterRef.current);
  }, []);

  useEffect(() => {
    const img = posterRef.current;
    if (img?.complete && img.naturalWidth > 0) applyBackdrop(img);
  }, []);

  useEffect(() => {
    if (mode !== "sequence") return;

    const section = sectionRef.current;
    const stage = stageRef.current;
    const sculpt = sculptRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !sculpt || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const abort = new AbortController();
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let frames: FrameSlot[] = [];
    let count = 1;
    let firstFrame: HTMLImageElement | null = null;
    let ready = false; // playback starts only once every frame is in memory
    let current = 0; // eased, fractional playhead in frames
    let lastDrawn = Number.NaN;
    let needsDraw = true;
    let running = false;
    let hintHidden = false;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastTransform = "";

    const nearestLoaded = (index: number) => {
      for (let i = index; i >= 0; i--) {
        const frame = frames[i];
        if (frame) return frame;
      }
      return firstFrame;
    };

    // Never an integer frame: the floor frame at full opacity, the next one
    // laid over it at the fractional alpha. Slow scrolls stay fluid.
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h || !firstFrame) return;
      if (!ready) {
        drawCover(ctx, firstFrame, w, h, 1);
        ctx.globalAlpha = 1;
        return;
      }
      const base = Math.floor(current);
      const frac = current - base;
      const floorFrame = nearestLoaded(base);
      if (floorFrame) drawCover(ctx, floorFrame, w, h, 1);
      const nextFrame = frames[base + 1];
      if (frac > 0 && nextFrame) drawCover(ctx, nextFrame, w, h, frac);
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; // resets context state and clears, so redraw now
        canvas.height = h;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      draw();
      lastDrawn = current;
      needsDraw = false;
    };

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const scrollProgress = clamp(-rect.top / travel);

      const target = ready ? scrollProgress * (count - 1) : 0;
      current += (target - current) * LERP;
      if (Math.abs(target - current) < SNAP) current = target;
      progressRef.current = count > 1 ? current / (count - 1) : 0;

      if (needsDraw || current !== lastDrawn) {
        draw();
        lastDrawn = current;
        needsDraw = false;
      }

      cylinderRef.current?.update();

      // Floating sculpture: follows the cursor at rest, settles as playback begins.
      const strength = finePointer ? 1 - smoothstep(0, TILT_FADE_FRAMES, current) : 0;
      mouseX += (targetX - mouseX) * TILT_EASE;
      mouseY += (targetY - mouseY) * TILT_EASE;
      let transform = "none";
      if (strength > 0.001) {
        const rx = -mouseY * 7 * strength;
        const ry = mouseX * 9 * strength;
        const tx = mouseX * 16 * strength;
        const ty = mouseY * 12 * strength;
        // Scale stays above 1 while tilted so the frame edges never show.
        const s = 1 + (0.045 + 0.02 * Math.hypot(mouseX, mouseY)) * strength;
        transform =
          `perspective(1400px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) ` +
          `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      }
      if (transform !== lastTransform) {
        sculpt.style.transform = transform;
        lastTransform = transform;
      }

      const hideHint = scrollProgress > 0.01;
      if (hideHint !== hintHidden && hintRef.current) {
        hintRef.current.style.opacity = hideHint ? "0" : "";
        hintHidden = hideHint;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { rootMargin: "64px 0px" },
    );
    io.observe(section);

    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }

    const setLoadProgress = (done: number, total: number) => {
      if (loaderBarRef.current) loaderBarRef.current.style.transform = `scaleX(${total ? done / total : 1})`;
    };

    (async () => {
      try {
        const manifest = await fetchManifest(abort.signal);
        const files = manifest.files;
        if (files.length === 0) {
          // Nothing extracted yet: keep the plain stage instead of failing on a missing poster.
          console.warn("[hero] No frames in public/hero/frames. Run `npm run frames -- path/to/video.mp4`.");
          return;
        }
        count = files.length;
        frames = new Array<FrameSlot>(count).fill(undefined);

        firstFrame = await loadImage(files[0]);
        if (abort.signal.aborted) return;
        frames[0] = firstFrame;
        resize();
        canvas.style.opacity = "1"; // 600ms CSS fade, over the identical poster

        await preloadRemaining(files, frames, setLoadProgress, abort.signal);
        if (abort.signal.aborted) return;
        ready = true;
        needsDraw = true;
      } catch (error) {
        if (abort.signal.aborted) return;
        console.error("[hero] Image sequence unavailable, keeping the still frame.", error);
      } finally {
        loaderRef.current?.setAttribute("data-done", "");
      }
    })();

    return () => {
      abort.abort();
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      sculpt.style.transform = "";
    };
  }, [mode]);

  return (
    <HeroProgressContext.Provider value={progressRef}>
      <section ref={sectionRef} id="top" aria-label="Introduction" className="hero-track relative">
        <h1 className="sr-only">{headlines.map((b) => `${b.lead} ${b.tail}`).join(" ")}</h1>

        <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden bg-stage">
          <div ref={sculptRef} className="sculpt absolute inset-0">
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element -- served as-is; the optimizer would only re-encode it
              <img
                ref={posterRef}
                src={poster}
                alt=""
                fetchPriority="high"
                draggable={false}
                onLoad={handlePosterLoad}
                className="absolute inset-0 h-full w-full object-cover select-none"
              />
            )}
            {mode === "sequence" && (
              <canvas
                ref={canvasRef}
                aria-hidden
                className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-[600ms] ease-out"
              />
            )}
          </div>

          <Scrims />

          <HeadlineCylinder
            ref={cylinderRef}
            beats={headlines}
            className="headline pointer-events-none absolute inset-x-6 bottom-[14svh] z-10 md:inset-x-auto md:bottom-auto md:left-[4vw] md:top-1/2 md:-translate-y-1/2"
          />

          {mode === "sequence" && (
            <>
              <div
                ref={loaderRef}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-ink/10 transition-opacity duration-700 data-[done]:opacity-0"
              >
                <div
                  ref={loaderBarRef}
                  className="h-full origin-left scale-x-0 bg-ink/55 transition-transform duration-300 ease-out"
                />
              </div>
              <p
                ref={hintRef}
                className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-graphite transition-opacity duration-500"
              >
                Scroll to begin
              </p>
            </>
          )}
        </div>
      </section>
    </HeroProgressContext.Provider>
  );
}

"use client";

import { useEffect, useRef } from "react";

/** Surfaces that light up under the cursor; their CSS reads --mx / --my / --tx / --ty / --fx / --fy. */
const LIT = ".panel, .glass, .cta";
/** Things worth clicking or hovering: the ring swells over them. */
const HOT = "a, button, .chip, input, select, textarea, [tabindex]";
/** Pull toward the cursor, as a share of its offset from the element's centre. */
const MAGNET_PULL = 0.3;

/**
 * Everything that follows the pointer: a soft light behind the page, a dot
 * and a lagging ring on top (which swell, or show the element's
 * `data-cursor` label, over interactive things), magnetic buttons, and the
 * hovered card's cursor position for its highlight, tilt and ink flood.
 * Mouse only: touch gets none of it.
 */
export default function CursorGlow() {
  const ambientRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ambient = ambientRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!ambient || !dot || !ring || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduced ? 1 : 0.18;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let frame = 0;
    let surface: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    // The ring eases toward the pointer, so it trails on fast moves.
    const tick = () => {
      rx += (x - rx) * ease;
      ry += (y - ry) * ease;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0;
    };

    const release = (el: HTMLElement | null) => {
      if (!el) return;
      el.removeAttribute("data-pull");
      el.style.translate = "";
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      ambient.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ambient.style.opacity = dot.style.opacity = ring.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(tick);

      const target = event.target instanceof Element ? event.target : null;
      const label = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      if (label) ring.setAttribute("data-label", label);
      else ring.removeAttribute("data-label");
      ring.toggleAttribute("data-hot", !label && !!target?.closest(HOT));

      // Magnetic buttons lean toward the pointer, then spring back.
      const nextMagnet = target?.closest<HTMLElement>(".magnetic") ?? null;
      if (nextMagnet !== magnet) {
        release(magnet);
        magnet = nextMagnet;
      }
      if (magnet && !reduced) {
        const r = magnet.getBoundingClientRect();
        const dx = (x - (r.left + r.width / 2)) * MAGNET_PULL;
        const dy = (y - (r.top + r.height / 2)) * MAGNET_PULL;
        magnet.setAttribute("data-pull", "");
        magnet.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      }

      const next = target?.closest<HTMLElement>(LIT) ?? null;
      if (!next) {
        surface = null;
        return;
      }
      const rect = next.getBoundingClientRect();
      const mx = x - rect.left;
      const my = y - rect.top;
      // Where the cursor came in: the ink flood grows from here.
      if (next !== surface) {
        next.style.setProperty("--fx", `${mx.toFixed(1)}px`);
        next.style.setProperty("--fy", `${my.toFixed(1)}px`);
        surface = next;
      }
      next.style.setProperty("--mx", `${mx.toFixed(1)}px`);
      next.style.setProperty("--my", `${my.toFixed(1)}px`);
      // -1 … 1 across the card, for the tilt.
      next.style.setProperty("--tx", ((mx / rect.width) * 2 - 1).toFixed(3));
      next.style.setProperty("--ty", ((my / rect.height) * 2 - 1).toFixed(3));
    };

    // On the way out, the flood drains back toward the exit point.
    const onOut = (event: PointerEvent) => {
      const from = event.target instanceof Element ? event.target.closest<HTMLElement>(LIT) : null;
      const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest(LIT) : null;
      if (!from || from === to) return;
      const rect = from.getBoundingClientRect();
      from.style.setProperty("--fx", `${(event.clientX - rect.left).toFixed(1)}px`);
      from.style.setProperty("--fy", `${(event.clientY - rect.top).toFixed(1)}px`);
    };

    const onLeave = () => {
      ambient.style.opacity = dot.style.opacity = ring.style.opacity = "0";
      release(magnet);
      magnet = null;
    };
    const onDown = () => ring.setAttribute("data-down", "");
    const onUp = () => ring.removeAttribute("data-down");

    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ambientRef} aria-hidden className="cursor-ambient" />
      <div ref={ringRef} aria-hidden className="cursor-ring" />
      <div ref={dotRef} aria-hidden className="cursor-dot" />
    </>
  );
}

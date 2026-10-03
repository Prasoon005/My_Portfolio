"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { about } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/media";

const CYCLE_MS = 2600;
const { layers } = about;

/** A small wireframe drawn on each plate, hinting at what that layer holds. */
function PlateArt({ name }: { name: string }) {
  switch (name) {
    case "Interface":
      return (
        <div className="plate-art grid grid-cols-3 grid-rows-3 gap-2">
          <i className="col-span-3" />
          <i className="row-span-2" />
          <i className="col-span-2" />
          <i />
          <i />
        </div>
      );
    case "Intelligence":
      return (
        <div className="plate-art grid place-items-center">
          <span className="plate-glyph">✦</span>
        </div>
      );
    case "API":
      return (
        <div className="plate-art flex flex-col justify-center gap-2.5">
          <i className="w-3/4" />
          <i className="w-1/2" />
          <i className="w-2/3" />
        </div>
      );
    default:
      return (
        <div className="plate-art grid grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      );
  }
}

/**
 * The full stack as an exploded isometric diagram. It steps through the
 * layers on its own; hovering a plate or its label takes over.
 */
export default function StackDiagram() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % layers.length), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [held]);

  const focus = (i: number) => {
    setHeld(true);
    setActive(i);
  };

  return (
    <div
      className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]"
      onPointerLeave={() => setHeld(false)}
    >
      <div className="stack" data-held={held || undefined} aria-hidden>
        <div className="stack-scene">
          {layers.map((layer, i) => (
            <div
              key={layer.name}
              className="plate"
              data-active={active === i || undefined}
              // Top layer first in content; highest plate in the scene.
              style={{ "--z": layers.length - 1 - i } as CSSProperties}
              onPointerEnter={() => focus(i)}
            >
              <PlateArt name={layer.name} />
              <span className="plate-label">{layer.name}</span>
            </div>
          ))}
        </div>
      </div>

      <ol className="space-y-1">
        {layers.map((layer, i) => (
          <li key={layer.name}>
            <button
              type="button"
              className="layer-row"
              data-active={active === i || undefined}
              onPointerEnter={() => focus(i)}
              onFocus={() => focus(i)}
              onBlur={() => setHeld(false)}
            >
              <span className="font-serif text-lg text-graphite italic tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-medium tracking-[-0.015em]">{layer.name}</span>
                <span className="layer-detail block text-[14px] text-graphite">
                  {layer.detail} <span className="opacity-60">· {layer.note}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

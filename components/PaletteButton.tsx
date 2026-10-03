"use client";

import { useEffect, useState } from "react";
import { OPEN_PALETTE } from "@/components/CommandPalette";

export default function PaletteButton() {
  const [shortcut, setShortcut] = useState("⌘K");

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("Ctrl K");
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))}
      aria-label="Open command palette"
      data-cursor="Search"
      className="flex items-center rounded-full px-2.5 py-2 transition-colors duration-300 hover:bg-white/45"
    >
      <kbd className="kbd">{shortcut}</kbd>
    </button>
  );
}

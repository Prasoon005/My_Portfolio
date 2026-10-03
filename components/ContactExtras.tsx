"use client";

import { useEffect, useState } from "react";
import { copyText } from "@/lib/toast";

export function CopyButton({ text, message }: { text: string; message: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), 1800);
    return () => window.clearTimeout(timer);
  }, [done]);

  return (
    <button
      type="button"
      data-cursor={done ? "Done" : "Copy"}
      onClick={() => copyText(text, message).then(setDone)}
      className="chip shrink-0 text-[13px]"
      aria-label={`Copy ${text}`}
    >
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

const TIME_ZONE = "Asia/Kolkata";

/** Live time where I am, so a reply window is easy to guess. */
export function LocalTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) return <span className="tabular-nums">--:--:--</span>;

  const time = now.toLocaleTimeString("en-GB", { timeZone: TIME_ZONE, hour12: false });
  const hour = Number(time.slice(0, 2));
  const awake = hour >= 8 && hour < 23;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-3">
      <span className="font-serif text-[1.15em] italic tabular-nums">{time}</span>
      <span className="text-[13px] tracking-[0.08em] text-graphite uppercase">
        IST · {awake ? "probably at the keyboard" : "probably asleep"}
      </span>
    </span>
  );
}

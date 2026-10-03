"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { subscribeStats, toggleLove, type StatsState } from "@/lib/stats-client";
import { toast } from "@/lib/toast";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** Digits roll like an odometer whenever the number changes. */
export function RollingNumber({ value }: { value: number }) {
  const text = value < 10000 ? value.toLocaleString("en") : compact.format(value);
  return (
    <span className="rolling" aria-label={value.toLocaleString("en")}>
      {Array.from(text, (ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${text.length}-${i}`} aria-hidden className="rolling-col">
            <span className="rolling-strip" style={{ "--n": Number(ch) } as CSSProperties}>
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`${text.length}-${i}`} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

export function useStats() {
  const [stats, setStats] = useState<StatsState | null>(null);
  useEffect(() => subscribeStats(setStats), []);
  return stats;
}

export function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="heart" data-filled={filled || undefined} aria-hidden>
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 8 3.4 4.5 6.9 4.5c2.1 0 3.6 1.2 4.4 2.6.2.3.6.3.8 0 .8-1.4 2.3-2.6 4.4-2.6 3.5 0 5.3 3.5 4.2 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
  );
}

/** A heart button with a burst of ink when it's given. */
export function LoveButton({
  stats,
  className = "",
  children,
}: {
  stats: StatsState | null;
  className?: string;
  children?: ReactNode;
}) {
  const [burst, setBurst] = useState(0);
  const loved = !!stats?.loved;

  const onClick = async () => {
    const nowLoved = await toggleLove();
    if (nowLoved) {
      setBurst((n) => n + 1);
      toast("Thank you. That made my day.");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={loved}
      aria-label={loved ? "Take back your heart" : "Leave a heart"}
      data-cursor={loved ? "Loved" : "Love it"}
      className={`love-button ${className}`}
      data-loved={loved || undefined}
    >
      <span className="relative grid place-items-center">
        <Heart filled={loved} />
        {burst > 0 && (
          <span key={burst} aria-hidden className="burst">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ "--a": `${i * 36}deg`, "--d": `${i % 2 ? 1.1 : 1.6}rem` } as CSSProperties} />
            ))}
          </span>
        )}
      </span>
      {children}
    </button>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" className="eye" aria-hidden>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Live views and hearts, top right. */
export default function LoveStats() {
  const stats = useStats();

  return (
    <div className="glass pointer-events-auto flex items-center rounded-full p-1.5 text-[14px]" data-ready={stats?.ready || undefined}>
      {/* Views make room for the name on phones; the footer still shows them. */}
      <span className="hidden items-center gap-1.5 px-3 py-2 text-ink/70 sm:flex" title="People who've visited">
        <Eye />
        <span className="sr-only">Views:</span>
        {stats?.ready ? <RollingNumber value={stats.views} /> : <span className="stat-skeleton" />}
      </span>
      <span aria-hidden className="hidden h-4 w-px bg-ink/15 sm:block" />
      <LoveButton stats={stats} className="rounded-full px-3 py-2">
        <span className="sr-only">Hearts:</span>
        {stats?.ready ? <RollingNumber value={stats.loves} /> : <span className="stat-skeleton" />}
      </LoveButton>
    </div>
  );
}

/** The ask, at the foot of the page. */
export function LovePrompt() {
  const stats = useStats();
  const loved = !!stats?.loved;
  return (
    <div className="flex flex-col items-center gap-5 pt-24 pb-6 text-center">
      <p className="text-[clamp(1.4rem,2.4vw,2rem)] leading-tight tracking-[-0.025em]">
        {loved ? "You left a heart. " : "Liked what you saw? "}
        <span className="font-serif italic">{loved ? "Thank you." : "Leave a heart."}</span>
      </p>
      <LoveButton stats={stats} className="love-big">
        <span className="tabular-nums">
          {stats?.ready ? <RollingNumber value={stats.loves} /> : "–"}
        </span>
        <span className="text-[13px] tracking-[0.12em] uppercase opacity-70">
          {stats?.loves === 1 ? "heart" : "hearts"}
        </span>
      </LoveButton>
      {stats?.ready && (
        <p className="text-[13px] text-graphite tabular-nums">
          {stats.views.toLocaleString("en")} {stats.views === 1 ? "person has" : "people have"} visited so far.
        </p>
      )}
    </div>
  );
}

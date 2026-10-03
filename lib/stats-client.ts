import type { Stats } from "@/lib/stats-store";

export interface StatsState extends Stats {
  /** Whether this browser has left a heart. */
  loved: boolean;
  ready: boolean;
}

const VIEWED_KEY = "portfolio:viewed";
const LOVED_KEY = "portfolio:loved";

let state: StatsState = { views: 0, loves: 0, loved: false, ready: false };
const listeners = new Set<(s: StatsState) => void>();
let started = false;

const set = (patch: Partial<StatsState>) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
};

// Storage can be blocked (private windows, strict settings): treat as unset.
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
};

async function call(action?: "view" | "love" | "unlove"): Promise<Stats | null> {
  try {
    const res = await fetch("/api/stats", {
      method: action ? "POST" : "GET",
      headers: action ? { "Content-Type": "application/json" } : undefined,
      body: action ? JSON.stringify({ action }) : undefined,
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Stats) : null;
  } catch {
    return null;
  }
}

/** Loads the totals once per page, counting this browser's first visit as a view. */
async function start() {
  if (started) return;
  started = true;
  set({ loved: read(LOVED_KEY) === "1" });
  const firstVisit = read(VIEWED_KEY) === null;
  const stats = await call(firstVisit ? "view" : undefined);
  if (!stats) return;
  if (firstVisit) write(VIEWED_KEY, "1");
  set({ ...stats, ready: true });
}

export function subscribeStats(listener: (s: StatsState) => void) {
  listeners.add(listener);
  listener(state);
  void start();
  return () => {
    listeners.delete(listener);
  };
}

/** Optimistic: the count moves at once, then settles on the server's number. */
export async function toggleLove() {
  const loving = !state.loved;
  set({ loved: loving, loves: Math.max(0, state.loves + (loving ? 1 : -1)) });
  write(LOVED_KEY, loving ? "1" : null);
  const stats = await call(loving ? "love" : "unlove");
  if (stats) set(stats);
  return loving;
}

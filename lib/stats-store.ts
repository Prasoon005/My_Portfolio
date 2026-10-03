import { promises as fs } from "node:fs";
import path from "node:path";

export interface Stats {
  views: number;
  loves: number;
}

export type Counter = keyof Stats;

/*
 * Two counters shared by every visitor.
 *
 * In production they live in Upstash Redis (free tier is plenty): set
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. Without those, they
 * fall back to a JSON file in .data/, which is fine for `next dev` or a
 * single long-running server, but not for serverless hosts like Vercel,
 * whose disks are thrown away between requests.
 */

const KEY_PREFIX = "portfolio:";
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis<T>(commands: (string | number)[][]): Promise<T[]> {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const rows = (await res.json()) as { result: T }[];
  return rows.map((row) => row.result);
}

const FILE = path.join(process.cwd(), ".data", "stats.json");

async function readFile(): Promise<Stats> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<Stats>;
    return { views: parsed.views ?? 0, loves: parsed.loves ?? 0 };
  } catch {
    return { views: 0, loves: 0 };
  }
}

// Serialise file writes so two requests can't interleave read-modify-write.
let queue: Promise<unknown> = Promise.resolve();

export async function getStats(): Promise<Stats> {
  if (url && token) {
    const [views, loves] = await redis<string | null>([
      ["GET", `${KEY_PREFIX}views`],
      ["GET", `${KEY_PREFIX}loves`],
    ]);
    return { views: Number(views ?? 0), loves: Number(loves ?? 0) };
  }
  return readFile();
}

export async function bump(counter: Counter, by: 1 | -1): Promise<Stats> {
  if (url && token) {
    const key = `${KEY_PREFIX}${counter}`;
    const [next] = await redis<number>([["INCRBY", key, by]]);
    // Never let an unlove race push it below zero.
    if (next < 0) await redis([["SET", key, 0]]);
    return getStats();
  }

  const run = queue.then(async () => {
    const stats = await readFile();
    stats[counter] = Math.max(0, stats[counter] + by);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(stats));
    return stats;
  });
  queue = run.catch(() => undefined);
  return run;
}

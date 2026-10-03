import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Frame URLs in playback order, read from public/hero/frames. The `?v=`
 * changes whenever the frames are re-extracted, so the year-long cache set
 * in next.config.ts can never serve a stale set.
 */
export async function listFrames(): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "hero", "frames");

  try {
    const names = (await readdir(dir))
      .filter((name) => IMAGE_EXT.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (names.length === 0) return [];

    const { mtimeMs } = await stat(path.join(dir, names[0]));
    const version = Math.round(mtimeMs).toString(36);
    return names.map((name) => `/hero/frames/${name}?v=${version}`);
  } catch {
    return [];
  }
}

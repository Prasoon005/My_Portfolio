const MANIFEST_ENDPOINT = "/api/frames";

export interface FrameManifest {
  count: number;
  files: string[];
}

/** undefined = not loaded yet, null = failed to load */
export type FrameSlot = HTMLImageElement | null | undefined;

export async function fetchManifest(signal: AbortSignal): Promise<FrameManifest> {
  const res = await fetch(MANIFEST_ENDPOINT, { signal });
  if (!res.ok) throw new Error(`Frame list request failed with status ${res.status}`);
  return (await res.json()) as FrameManifest;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      // decode() keeps the first draw off the main thread's critical path.
      img
        .decode()
        .catch(() => undefined)
        .then(() => resolve(img));
    };
    img.onerror = () => reject(new Error(`Frame failed to load: ${src}`));
    img.src = src;
  });
}

/** Fills every empty slot in `frames`, a few requests at a time. */
export async function preloadRemaining(
  files: string[],
  frames: FrameSlot[],
  onProgress: (done: number, total: number) => void,
  signal: AbortSignal,
  concurrency = 6,
) {
  let cursor = 0;
  let done = frames.filter((f) => f !== undefined).length;
  onProgress(done, files.length);

  const worker = async () => {
    while (!signal.aborted) {
      const i = cursor++;
      if (i >= files.length) return;
      if (frames[i] !== undefined) continue;
      try {
        frames[i] = await loadImage(files[i]);
      } catch {
        frames[i] = null; // drawing falls back to the nearest earlier frame
      }
      done++;
      onProgress(done, files.length);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
}

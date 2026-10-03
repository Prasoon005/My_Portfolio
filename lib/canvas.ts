/** Draws `img` like CSS object-fit: cover into a w×h (device pixel) canvas. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  alpha: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/**
 * Averages the two top corners of the frame so the page background, scrims
 * and the edges revealed by the tilt all match the studio backdrop exactly.
 */
export function sampleBackdrop(img: HTMLImageElement): string | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;

  const size = 8;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const regionW = w * 0.08;
  const regionH = h * 0.08;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;

  try {
    for (const sx of [0, w - regionW]) {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, sx, 0, regionW, regionH, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
    }
  } catch {
    return null;
  }

  return `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`;
}

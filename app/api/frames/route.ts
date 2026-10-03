import { listFrames } from "@/lib/frames-server";

// Reads public/hero/frames and returns whatever is there. In `next dev` it
// re-reads on every request; in production it is evaluated against the
// deployed folder, so dropping in a new set of frames never needs a code change.
export const dynamic = "force-static";

export async function GET() {
  const files = await listFrames();
  return Response.json({ count: files.length, files });
}

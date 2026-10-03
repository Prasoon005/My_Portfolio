import { bump, getStats } from "@/lib/stats-store";

// Live numbers: never cached, never prerendered.
export const dynamic = "force-dynamic";

const actions = {
  view: ["views", 1],
  love: ["loves", 1],
  unlove: ["loves", -1],
} as const;

export async function GET() {
  try {
    return Response.json(await getStats());
  } catch {
    return Response.json({ error: "Stats unavailable" }, { status: 503 });
  }
}

/** Body: { "action": "view" | "love" | "unlove" }. Returns the new totals. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  const action = body?.action && body.action in actions ? actions[body.action as keyof typeof actions] : null;
  if (!action) return Response.json({ error: "Unknown action" }, { status: 400 });

  try {
    return Response.json(await bump(action[0], action[1]));
  } catch {
    return Response.json({ error: "Stats unavailable" }, { status: 503 });
  }
}

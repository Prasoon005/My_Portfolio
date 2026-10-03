import { projects, type Project } from "@/lib/content";

// "JWT auth" in the toolkit is "JWT" on a project, "Gemini API" is "Gemini", and so on.
const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace(/\b(api|auth)\b/g, "")
    .trim();

export const sameTool = (a: string, b: string) => normalize(a) === normalize(b);

export const projectUses = (project: Project, tool: string) => project.stack.some((tech) => sameTool(tech, tool));

/** Names of the projects a tool actually shipped in. */
export const usedIn = (tool: string) => projects.filter((p) => projectUses(p, tool)).map((p) => p.name);

/* A tiny channel so the Toolkit (and the command palette) can filter Work. */

type Listener = (tool: string | null) => void;
const listeners = new Set<Listener>();

export function setToolFilter(tool: string | null) {
  listeners.forEach((listener) => listener(tool));
}

export function onToolFilter(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

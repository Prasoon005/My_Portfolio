export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const SMALL_SCREEN_QUERY = "(max-width: 768px)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Small screens and reduced-motion users get the still frame, never the sequence. */
export function isStaticEnvironment() {
  if (typeof window === "undefined") return true;
  return prefersReducedMotion() || window.matchMedia(SMALL_SCREEN_QUERY).matches;
}

import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/** Scrolls through Lenis when it's running, natively otherwise (reduced motion). */
export function scrollToTarget(target: string) {
  if (instance) {
    instance.scrollTo(target);
    return;
  }
  const el = document.querySelector(target);
  el?.scrollIntoView({ behavior: "auto", block: "start" });
}

"use client";

import { createContext, useContext, type RefObject } from "react";

/**
 * Eased hero progress (0 → 1), written once per frame by the hero loop.
 * Anything that has to stay in lockstep with the image sequence reads it.
 */
export const HeroProgressContext = createContext<RefObject<number>>({ current: 0 });

export const useHeroProgress = () => useContext(HeroProgressContext);

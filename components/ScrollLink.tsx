"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { scrollToTarget } from "@/lib/lenis-store";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function ScrollLink({ href, onClick, children, ...rest }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !href.startsWith("#")) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToTarget(href);
    window.history.replaceState(null, "", href);
  };

  return (
    <a href={href} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}

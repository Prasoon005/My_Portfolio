"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { nav, projects, site, toolkit } from "@/lib/content";
import { getLenis, scrollToTarget } from "@/lib/lenis-store";
import { copyText } from "@/lib/toast";
import { setToolFilter, usedIn } from "@/lib/tools";

export const OPEN_PALETTE = "palette:open";

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

const jump = (href: string) => {
  scrollToTarget(href);
  window.history.replaceState(null, "", href);
};

const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

function buildCommands(): Command[] {
  const sections: Command[] = [{ href: "#top", label: "Top" }, ...nav, { href: "#contact", label: "Contact" }].map(
    (item, i) => ({
      id: `go-${item.href}`,
      group: "Go to",
      label: item.label,
      hint: String(i).padStart(2, "0"),
      run: () => jump(item.href),
    }),
  );

  const actions: Command[] = [
    {
      id: "copy-email",
      group: "Contact",
      label: "Copy email address",
      hint: site.email,
      run: () => copyText(site.email, "Email copied"),
    },
    { id: "mail", group: "Contact", label: "Write an email", hint: "mailto", run: () => (location.href = `mailto:${site.email}`) },
    { id: "github", group: "Contact", label: "GitHub", hint: "↗", run: () => open(site.links.github) },
    { id: "linkedin", group: "Contact", label: "LinkedIn", hint: "↗", run: () => open(site.links.linkedin) },
    { id: "leetcode", group: "Contact", label: "LeetCode", hint: "↗", run: () => open(site.links.leetcode) },
  ];

  const work: Command[] = projects.map((project) => ({
    id: `project-${project.name}`,
    group: "Projects",
    label: project.name,
    hint: "code ↗",
    run: () => open(project.href),
  }));

  const filters: Command[] = toolkit
    .flatMap((row) => row.items)
    .filter((tool) => usedIn(tool).length)
    .map((tool) => ({
      id: `filter-${tool}`,
      group: "Built with",
      label: `Projects built with ${tool}`,
      hint: String(usedIn(tool).length),
      run: () => {
        setToolFilter(tool);
        jump("#work");
      },
    }));

  return [...sections, ...actions, ...work, ...filters];
}

/** Every word of the query must appear somewhere in the label, group or hint. */
const matches = (command: Command, query: string) => {
  const haystack = `${command.label} ${command.group} ${command.hint ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

/**
 * ⌘K / Ctrl+K (or "/") opens a quick launcher: jump to a section, copy the
 * email, open a profile or project, or filter Work by a tool.
 */
export default function CommandPalette() {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const commands = useMemo(buildCommands, []);
  const results = useMemo(() => commands.filter((c) => matches(c, query)), [commands, query]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && event.target.closest("input, textarea, select");
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setOpen((was) => !was);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
    };
  }, []);

  // The page holds still while the palette is up.
  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setCursor(0);
    getLenis()?.stop();
    const previous = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      getLenis()?.start();
      previous?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector("[data-cursor-on]")?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    setOpen(false);
    // Let the palette close (and the scroll lock lift) before acting.
    requestAnimationFrame(() => command.run());
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (c + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(results[cursor]);
    }
  };

  if (!isOpen) return null;

  let lastGroup = "";
  return (
    <div className="palette-backdrop" onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="palette" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-ink/10 px-5">
          <span aria-hidden className="text-graphite">
            ⌕
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to, copy, open, filter…"
            aria-label="Search commands"
            aria-controls="palette-list"
            aria-activedescendant={results[cursor] ? `cmd-${results[cursor].id}` : undefined}
            className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-graphite/70"
          />
          <kbd className="kbd">esc</kbd>
        </div>

        <ul ref={listRef} id="palette-list" role="listbox" className="palette-list" data-lenis-prevent>
          {results.length === 0 && <li className="px-5 py-8 text-center text-graphite">Nothing matches “{query}”.</li>}
          {results.map((command, i) => {
            const header = command.group !== lastGroup ? command.group : null;
            lastGroup = command.group;
            return (
              <li key={command.id} role="presentation">
                {header && <p className="palette-group">{header}</p>}
                <div
                  id={`cmd-${command.id}`}
                  role="option"
                  aria-selected={i === cursor}
                  data-cursor-on={i === cursor || undefined}
                  className="palette-item"
                  onPointerMove={() => setCursor(i)}
                  onClick={() => run(command)}
                >
                  <span>{command.label}</span>
                  {command.hint && <span className="palette-hint">{command.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-ink/10 px-5 py-3 text-[12px] text-graphite">
          <span>
            <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="kbd">↵</kbd> run
          </span>
          <span className="ml-auto">
            <kbd className="kbd">/</kbd> anytime
          </span>
        </div>
      </div>
    </div>
  );
}

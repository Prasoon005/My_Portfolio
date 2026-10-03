import LoveStats from "@/components/LoveStats";
import PaletteButton from "@/components/PaletteButton";
import ScrollLink from "@/components/ScrollLink";
import { nav, site } from "@/lib/content";

/**
 * The header box itself ignores the pointer; only the pill and the CTA
 * catch clicks, so nothing underneath is ever blocked.
 */
export default function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-4 md:p-6">
      <nav aria-label="Primary" className="glass pointer-events-auto flex items-center rounded-full p-1.5">
        <ScrollLink href="#top" className="rounded-full px-4 py-2 text-[15px] font-medium tracking-[-0.01em]">
          {site.name}
        </ScrollLink>
        <span aria-hidden className="mx-1 hidden h-4 w-px bg-ink/15 md:block" />
        <ul className="hidden items-center md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <ScrollLink
                href={item.href}
                className="block rounded-full px-4 py-2 text-[15px] text-ink/70 transition-colors duration-300 hover:bg-white/45 hover:text-ink"
              >
                {item.label}
              </ScrollLink>
            </li>
          ))}
        </ul>
        <span className="hidden items-center md:flex">
          <span aria-hidden className="mx-1 h-4 w-px bg-ink/15" />
          <PaletteButton />
        </span>
      </nav>

      <div className="flex items-start gap-3">
        <LoveStats />
        {/* On phones the stats take this spot; Contact is one scroll away. */}
        <ScrollLink
          href="#contact"
          className="cta magnetic pointer-events-auto hidden rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.01em] sm:block"
        >
          Get in touch
        </ScrollLink>
      </div>
    </header>
  );
}

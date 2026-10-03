import CountUp from "@/components/CountUp";
import CraftDemos from "@/components/CraftDemos";
import InkText from "@/components/InkText";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import StackDiagram from "@/components/StackDiagram";
import { about } from "@/lib/content";

export default function About() {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <SectionHeading index="01" label="About" lead="A developer who" tail="ships the whole thing." />

        {/* The statement as type, not a card: it inks in as it's read. */}
        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <InkText
            text={about.statement}
            className="text-[clamp(1.6rem,3.2vw,2.75rem)] leading-[1.18] tracking-[-0.03em] lg:col-span-10"
          />
          <Reveal className="lg:col-span-12">
            <dl className="grid gap-6 border-t border-ink/15 pt-6 sm:grid-cols-3">
              {about.facts.map((fact) => (
                <div key={fact.term} className="flex items-baseline gap-4">
                  <dt className="w-20 shrink-0 text-[12px] tracking-[0.14em] text-graphite uppercase">{fact.term}</dt>
                  <dd className="text-[15.5px] leading-snug">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-12">
          <Reveal className="panel p-7 md:p-9 lg:col-span-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] tracking-[0.12em] text-graphite uppercase">The whole stack</p>
              <p className="text-[13px] text-graphite">Hover a layer</p>
            </div>
            <div className="mt-4">
              <StackDiagram />
            </div>
          </Reveal>

          <ul className="grid grid-cols-2 gap-5 lg:col-span-5">
            {about.stats.map((stat, i) => (
              <li key={stat.label} className="flex">
                <Reveal
                  delay={80 * (i + 1)}
                  className="panel flood tilt flex w-full flex-col justify-between gap-8 overflow-hidden p-6 md:p-7"
                >
                  <p className="font-serif text-[clamp(2.75rem,5vw,4.25rem)] leading-none tracking-[-0.02em] italic">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="max-w-[18ch] text-[15px] leading-snug text-graphite">{stat.label}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <CraftDemos />
      </div>
    </section>
  );
}

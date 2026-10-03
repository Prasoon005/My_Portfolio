import { CopyButton, LocalTime } from "@/components/ContactExtras";
import ContactForm from "@/components/ContactForm";
import { LovePrompt } from "@/components/LoveStats";
import Reveal from "@/components/Reveal";
import ScrollLink from "@/components/ScrollLink";
import SectionHeading from "@/components/SectionHeading";
import Signature from "@/components/Signature";
import { site } from "@/lib/content";

const elsewhere = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "LeetCode", href: site.links.leetcode },
];

const valueClass = "mt-2 text-[clamp(1.05rem,1.5vw,1.3rem)] leading-snug tracking-[-0.01em] break-words";
const linkClass = "underline decoration-ink/25 underline-offset-[5px] transition-colors hover:decoration-ink";

export default function Contact() {
  return (
    <>
      <section id="contact" className="section">
        <div className="wrap">
          <SectionHeading index="05" label="Contact" lead="Let's" tail="talk.">
            Open to software engineering roles. I reply by email.
          </SectionHeading>

          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            <Reveal className="flex flex-col gap-5 lg:col-span-5">
              <dl className="panel divide-y divide-ink/12 px-7 md:px-8">
                <div className="py-6">
                  <dt className="flex items-center gap-2.5 text-[13px] tracking-[0.12em] text-graphite uppercase">
                    <span aria-hidden className="status-dot" />
                    Status
                  </dt>
                  <dd className={valueClass}>Open to software engineering roles</dd>
                </div>
                <div className="py-6">
                  <dt className="text-[13px] tracking-[0.12em] text-graphite uppercase">Email</dt>
                  <dd className={`${valueClass} flex items-center justify-between gap-3`}>
                    <a href={`mailto:${site.email}`} data-cursor="Write" className={`${linkClass} min-w-0`}>
                      {site.email}
                    </a>
                    <CopyButton text={site.email} message="Email copied" />
                  </dd>
                </div>
                {site.phone && (
                  <div className="py-6">
                    <dt className="text-[13px] tracking-[0.12em] text-graphite uppercase">Phone</dt>
                    <dd className={valueClass}>
                      <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className={linkClass}>
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="py-6">
                  <dt className="text-[13px] tracking-[0.12em] text-graphite uppercase">{site.location}</dt>
                  <dd className={valueClass}>
                    <LocalTime />
                  </dd>
                </div>
              </dl>

              <ul className="flex flex-wrap gap-3">
                {elsewhere.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="Visit"
                      className="glass magnetic inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium"
                    >
                      {link.label}
                      <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-7">
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="overflow-hidden">
        <LovePrompt />
        <Signature />
        <div className="wrap flex flex-col gap-3 border-t border-ink/15 py-8 text-sm text-graphite sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p className="hidden md:block">
            Press <kbd className="kbd">/</kbd> to get around
          </p>
          <ScrollLink href="#top" data-cursor="Up" className="magnetic inline-block hover:text-ink">
            Back to top ↑
          </ScrollLink>
        </div>
      </footer>
    </>
  );
}

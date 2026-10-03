"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/content";

/** Free key from web3forms.com. Without it the form opens the visitor's mail app instead. */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const ENDPOINT = "https://api.web3forms.com/submit";

const reasons = ["A job opportunity", "An internship", "A project or collaboration", "Something else"];

type Status = "idle" | "sending" | "sent" | "mail" | "error";

const messages: Record<Exclude<Status, "idle" | "sending">, string> = {
  sent: "Thanks, your message is on its way. I'll reply by email.",
  mail: "Your mail app should have opened with the message ready to send.",
  error: `That didn't go through. Please email me directly at ${site.email}.`,
};

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const subject = `Portfolio enquiry (${data.reason}) from ${data.name}${data.company ? `, ${data.company}` : ""}`;

    if (!ACCESS_KEY) {
      const body = [data.message, "", data.name, data.email, data.phone].filter((line) => line !== undefined).join("\n");
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
      setStatus("mail");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: ACCESS_KEY, subject, from_name: data.name, ...data }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) throw new Error(`Form request failed with status ${res.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-5 p-7 sm:grid-cols-2 md:p-10">
      <label className="block">
        <span className="text-sm text-graphite">Your name</span>
        <input className="field mt-2" name="name" type="text" autoComplete="name" required placeholder="Jane Doe" />
      </label>
      <label className="block">
        <span className="text-sm text-graphite">Email</span>
        <input
          className="field mt-2"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="jane@company.com"
        />
      </label>
      <label className="block">
        <span className="text-sm text-graphite">Company or college (optional)</span>
        <input className="field mt-2" name="company" type="text" autoComplete="organization" />
      </label>
      <label className="block">
        <span className="text-sm text-graphite">Phone (optional)</span>
        <input className="field mt-2" name="phone" type="tel" autoComplete="tel" />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-sm text-graphite">I&apos;m reaching out about</span>
        <select className="field mt-2" name="reason" defaultValue={reasons[0]}>
          {reasons.map((reason) => (
            <option key={reason}>{reason}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="text-sm text-graphite">Message</span>
        <textarea
          className="field mt-2"
          name="message"
          required
          placeholder="Tell me about the role or the project, and how I can help."
        />
      </label>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="cta rounded-full px-7 py-3.5 text-[15px] font-medium tracking-[-0.01em] transition-transform duration-300 ease-out hover:-translate-y-px disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p role="status" aria-live="polite" className="text-[15px] leading-snug text-graphite">
          {status === "idle" || status === "sending" ? "" : messages[status]}
        </p>
      </div>
    </form>
  );
}

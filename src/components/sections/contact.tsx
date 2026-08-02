"use client";

import { ArrowUpRight, Copy, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { profile } from "@/lib/data";

export function Contact() {
  return (
    <section id="contact" className="section-y relative z-10 overflow-hidden border-t border-line bg-bg">
      {/* Ambient crimson bloom anchoring the closing statement */}
      <div
        aria-hidden
        className="ambient left-1/2 top-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "var(--glow-a)" }}
      />

      <div className="shell relative flex flex-col items-center gap-12 text-center">
        <Reveal className="flex items-center gap-3">
          <span className="h-px w-8 bg-brand" aria-hidden />
          <span className="text-label text-accent">06 — Contact</span>
          <span className="h-px w-8 bg-brand" aria-hidden />
        </Reveal>

        <TextReveal
          as="h2"
          text="Have something worth building? Let's talk."
          accentWords={["Let's", "talk."]}
          className="text-display max-w-4xl"
        />

        <Reveal delay={0.1}>
          <p className="text-lead mx-auto max-w-xl">
            I&rsquo;m open to full-time roles, contract work and freelance projects — remote or
            relocation. The fastest way to reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.16} className="w-full">
          <EmailPlaque />
        </Reveal>

        <Reveal delay={0.22}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.26}>
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex h-14 items-center gap-2 rounded-full bg-brand px-8 text-base font-medium text-white shadow-[0_14px_40px_-14px_rgb(var(--brand-rgb)/0.9)] transition-colors duration-[260ms] hover:bg-brand-700"
              >
                Send an email
                <ArrowUpRight className="h-4 w-4 transition-transform duration-[260ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Magnetic>

            <Magnetic strength={0.2}>
              <a
                href={`https://wa.me/${profile.phoneHref.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center rounded-full border border-line-strong px-8 text-base font-medium transition-colors duration-[260ms] hover:border-brand hover:text-accent"
              >
                Message on WhatsApp
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.28} className="w-full">
          <dl className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
            {[
              { k: "Location", v: profile.location },
              { k: "Timezone", v: profile.timezone },
              { k: "Phone", v: profile.phone },
              { k: "Languages", v: profile.languages.join(" · ") },
            ].map((row) => (
              <div key={row.k} className="bg-bg p-5 text-left">
                <dt className="text-label text-fg-subtle">{row.k}</dt>
                <dd className="mt-1.5 text-sm text-fg">{row.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ email */

function EmailPlaque() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied — the mailto link beside it still works.
      setCopied(false);
    }
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <a
        href={`mailto:${profile.email}`}
        className="glass group flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full px-6 py-3 transition-colors duration-[260ms] hover:border-brand/50"
      >
        <span className="text-mono-sm break-all text-fg transition-colors group-hover:text-accent sm:text-base">
          {profile.email}
        </span>
      </a>

      <button
        type="button"
        onClick={copy}
        className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium transition-colors duration-[260ms] hover:border-brand hover:text-accent"
        aria-label={copied ? "Email address copied" : "Copy email address to clipboard"}
      >
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </motion.span>
        {/* aria-live announces the state change without moving focus */}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { useRef } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { EASE_EXPO } from "@/lib/motion";
import { profile, stats } from "@/lib/data";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Copy drifts up and fades as the hero leaves — a parallax handoff to the
  // next section rather than a hard cut.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const lines = [profile.firstName, profile.lastName];

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-28 pb-16"
    >
      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="shell relative z-10 flex flex-col gap-10"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="flex flex-col gap-7">
            {/* Availability */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE_EXPO }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                <span className="text-label text-fg-muted">Available for work</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-label text-fg-subtle">
                <MapPin className="h-3 w-3" aria-hidden />
                {profile.location}
              </span>
            </motion.div>

            {/* Name */}
            <h1 className="text-hero" aria-label={profile.fullName}>
              {lines.map((line, i) => (
                <span
                  key={line}
                  aria-hidden
                  className="block overflow-hidden"
                  style={{ paddingBottom: "0.06em", marginBottom: "-0.06em" }}
                >
                  <motion.span
                    className="block"
                    initial={reduce ? { opacity: 0 } : { y: "108%" }}
                    animate={reduce ? { opacity: 1 } : { y: "0%" }}
                    transition={{
                      duration: reduce ? 0.4 : 1.15,
                      delay: reduce ? 0 : 0.25 + i * 0.11,
                      ease: EASE_EXPO,
                    }}
                  >
                    {i === 1 ? (
                      <span className="text-brand-gradient italic">{line}</span>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Role + summary */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE_EXPO }}
              className="flex max-w-xl flex-col gap-5"
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand" aria-hidden />
                <p className="text-label text-accent">{profile.role}</p>
              </div>
              <p className="text-lead">{profile.summary}</p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.68, ease: EASE_EXPO }}
              className="flex flex-wrap items-center gap-3"
            >
              <Magnetic strength={0.28}>
                <a
                  href="#work"
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-brand px-8 text-base font-medium text-white shadow-[0_14px_40px_-14px_rgb(var(--brand-rgb)/0.9)] transition-colors duration-[260ms] hover:bg-brand-700"
                >
                  View selected work
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-[260ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>

              <Magnetic strength={0.22}>
                <a
                  href="#contact"
                  className="inline-flex h-14 items-center rounded-full border border-line-strong px-8 text-base font-medium text-fg transition-colors duration-[260ms] hover:border-brand hover:text-accent"
                >
                  Get in touch
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Right column stays empty on desktop — the 3D object lives here. */}
          <div aria-hidden className="hidden lg:block lg:h-[34rem]" />
        </div>

        {/* Stat rail */}
        <motion.dl
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: EASE_EXPO }}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 bg-bg/70 p-5 backdrop-blur-sm">
              <dt className="text-label text-fg-subtle">{stat.label}</dt>
              <dd className="flex items-baseline gap-2">
                <span className="font-display text-3xl leading-none">{stat.value}</span>
              </dd>
              <p className="text-mono-sm text-fg-subtle">{stat.detail}</p>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-fg-subtle transition-colors hover:text-accent lg:flex"
        aria-label="Scroll to about section"
      >
        <span className="text-label">Scroll</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" aria-hidden />
        </motion.span>
      </motion.a>
    </section>
  );
}

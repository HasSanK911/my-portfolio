"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { experience } from "@/lib/data";

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="section-y relative z-10 border-t border-line bg-bg">
      <div className="shell flex flex-col gap-14">
        <SectionHeading
          index="03"
          eyebrow="Experience"
          title="Where I've worked."
          accentWords={["worked."]}
          description="Two front-end roles across four years — one ongoing."
        />

        <div ref={ref} className="relative">
          {/* Spine */}
          <div
            aria-hidden
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-line md:block"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: reduce ? 1 : lineScale }}
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px origin-top bg-brand md:block"
          />

          <ol className="flex flex-col gap-14 md:gap-20">
            {experience.map((job, i) => (
              <li key={job.company} className="relative md:pl-14">
                {/* Node */}
                <span
                  aria-hidden
                  className="absolute left-0 top-2 hidden h-[15px] w-[15px] items-center justify-center rounded-full border-2 border-bg bg-line-strong md:flex"
                >
                  {job.current ? (
                    <span className="h-[7px] w-[7px] rounded-full bg-brand" />
                  ) : null}
                </span>

                <Reveal direction="up" delay={i * 0.06}>
                  <article className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-2xl leading-tight tracking-tight md:text-3xl">
                            {job.company}
                          </h3>
                          {job.current ? (
                            <span className="text-label inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-[rgb(var(--brand-rgb)/0.08)] px-2.5 py-1 text-accent">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
                              Current
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-fg-muted">{job.role}</p>
                      </div>
                      <span className="text-mono-sm shrink-0 text-fg-subtle">{job.period}</span>
                    </div>

                    <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-fg-muted">
                      {job.description}
                    </p>

                    <ul className="flex max-w-2xl flex-col gap-2.5">
                      {job.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                          <span
                            aria-hidden
                            className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-brand"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <ul className="flex flex-wrap gap-1.5">
                      {job.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-line px-3 py-1 text-[0.6875rem] tracking-wide text-fg-subtle"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

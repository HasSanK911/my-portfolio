"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import type { ProjectLogo } from "@/lib/assets";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  index: number;
  className?: string;
  priority?: boolean;
  /** Resolved by the server parent via `projectCover()`; undefined = placeholder. */
  coverSrc?: string;
  /** Resolved by the server parent via `projectLogo()`; undefined = no lockup. */
  logo?: ProjectLogo;
};

export function ProjectCard({
  project,
  index,
  className,
  priority,
  coverSrc,
  logo,
}: ProjectCardProps) {
  return (
    <TiltCard max={5} className={cn("h-full rounded-xl", className)}>
      <Link
        href={`/work/${project.slug}`}
        aria-label={`${project.title} — ${project.subtitle}. View case study.`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors duration-[420ms] hover:border-brand/45"
      >
        <div className="relative overflow-hidden">
          <PlaceholderImage
            src={coverSrc}
            alt={`${project.title} preview`}
            label={project.title}
            hint={`/images/work/${project.slug}-cover.jpg`}
            ratio="16 / 10"
            rounded="none"
            priority={priority}
            imageClassName="transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 44vw"
          />

          {/* Index + category rail */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="text-label rounded-full bg-bg/75 px-2.5 py-1.5 text-fg-muted backdrop-blur-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-label rounded-full bg-bg/75 px-2.5 py-1.5 text-accent backdrop-blur-sm">
              {project.category}
            </span>
          </div>

          {/* Brand lockup. The chip holds its polarity across both themes —
              it exists to suit the artwork, not the page around it. */}
          {logo ? (
            <span
              className={cn(
                "pointer-events-none absolute bottom-4 left-4 inline-flex items-center rounded-lg px-3 py-2 shadow-sm ring-1 backdrop-blur-sm",
                project.logoChip === "dark"
                  ? "bg-[#0e0e12]/95 ring-white/15"
                  : "bg-white/95 ring-black/10",
              )}
            >
              <Image
                src={logo.src}
                alt={`${project.title} logo`}
                width={logo.width}
                height={logo.height}
                sizes="120px"
                className="h-5 w-auto"
              />
            </span>
          ) : null}

          {/* Hover affordance — supplementary only; the whole card is a link */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-4 right-4 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-brand text-white opacity-0 transition-all duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl leading-tight tracking-tight transition-colors duration-300 group-hover:text-accent md:text-[1.75rem]">
              {project.title}
            </h3>
            <span className="text-mono-sm shrink-0 text-fg-subtle">{project.period}</span>
          </div>

          <p className="text-sm leading-relaxed text-fg-muted">{project.subtitle}</p>

          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.stack.slice(0, 4).map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-line px-2.5 py-1 text-[0.6875rem] tracking-wide text-fg-subtle"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </TiltCard>
  );
}

import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { ProjectCard } from "@/components/ui/project-card";
import { projects } from "@/lib/data";
import { projectCover } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Twelve major products out of 30+ shipped — enterprise dashboards, e-commerce, healthcare, fintech and media, built with Angular, React, Next.js and Laravel.",
  alternates: { canonical: "/work" },
};

export default function WorkIndexPage() {
  // Newest first — `order` encodes the end date as YYYYMM.
  const sorted = [...projects].sort((a, b) => b.order - a.order);

  return (
    <div className="relative z-10 bg-bg pb-24 pt-36 md:pt-44">
      <div className="shell flex flex-col gap-14">
        <header className="flex flex-col gap-6">
          <Reveal className="flex items-center gap-3">
            <span className="h-px w-8 bg-brand" aria-hidden />
            <span className="text-label text-accent">
              Archive — {projects.length} major projects
            </span>
          </Reveal>

          <TextReveal
            as="h1"
            text="The work I'd show first."
            accentWords={["first."]}
            className="text-hero !text-[clamp(2.75rem,8vw,6.5rem)]"
            immediate
          />

          <Reveal delay={0.12}>
            <p className="text-lead max-w-2xl">
              My {projects.length} major builds out of 30+ projects shipped — enterprise dashboards,
              storefronts, healthcare systems, marketing sites and a POS platform, ordered from most
              recent.
            </p>
          </Reveal>
        </header>

        <div className="rule-fade" aria-hidden />

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {sorted.map((project, i) => (
            <Reveal key={project.slug} direction="up" delay={(i % 2) * 0.06}>
              <ProjectCard
                project={project}
                index={i}
                priority={i < 2}
                coverSrc={projectCover(project.slug)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/ui/project-card";
import { featuredProjects, projects } from "@/lib/data";
import { projectCover, projectLogo } from "@/lib/assets";

export function Work() {
  return (
    <section id="work" className="section-y relative z-10 border-t border-line bg-bg">
      <div className="shell flex flex-col gap-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="02"
            eyebrow="Selected work"
            title="Products I've designed, built and shipped."
            accentWords={["shipped."]}
            description={`${projects.length} major builds out of 30+ projects shipped — these are the ones worth the walkthrough.`}
            className="flex-1"
          />
          <Reveal direction="left" delay={0.1}>
            <Link
              href="/work"
              className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium transition-colors duration-[260ms] hover:border-brand hover:text-accent"
            >
              All {projects.length} major projects
              <ArrowUpRight className="h-4 w-4 transition-transform duration-[260ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        {/* Editorial two-column grid: the right column drops to break the
            horizontal rhythm and stop the page reading as a plain table. */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <Reveal
              key={project.slug}
              direction="up"
              delay={(i % 2) * 0.08}
              className={i % 2 === 1 ? "lg:mt-20" : undefined}
            >
              <ProjectCard
                project={project}
                index={i}
                priority={i < 2}
                coverSrc={projectCover(project.slug)?.src}
                logo={projectLogo(project.slug)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

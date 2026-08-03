import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Reveal, RevealItem, StaggerGroup } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { getAdjacentProjects, getProject, profile, projects } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { projectCover, projectGallery } from "@/lib/assets";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  const description = project.summary;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — ${profile.fullName}`,
      description,
      url: `${siteUrl}/work/${project.slug}`,
    },
    twitter: { card: "summary_large_image", title: project.title, description },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getAdjacentProjects(slug);
  const cover = projectCover(project.slug);
  const gallery = projectGallery(project.slug, project.gallery);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    dateCreated: project.period,
    url: `${siteUrl}/work/${project.slug}`,
    author: { "@type": "Person", name: profile.fullName },
    keywords: project.stack.join(", "),
  };

  return (
    <article className="relative z-10 bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ------------------------------------------------------------ hero */}
      <header className="relative overflow-hidden pb-16 pt-36 md:pt-44">
        <div
          aria-hidden
          className="ambient left-1/2 top-0 h-[34vmax] w-[34vmax] -translate-x-1/2 -translate-y-1/3"
          style={{ background: "var(--glow-a)" }}
        />

        <div className="shell relative flex flex-col gap-8">
          <Reveal>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-[260ms] group-hover:-translate-x-1" />
              All work
            </Link>
          </Reveal>

          <div className="flex flex-wrap items-center gap-3">
            <Reveal direction="up">
              <span className="text-label rounded-full border border-brand/40 bg-[rgb(var(--brand-rgb)/0.08)] px-3 py-1.5 text-accent">
                {project.category}
              </span>
            </Reveal>
            <Reveal direction="up" delay={0.05}>
              <span className="text-mono-sm text-fg-subtle">{project.period}</span>
            </Reveal>
          </div>

          <TextReveal
            as="h1"
            text={project.title}
            className="text-hero !text-[clamp(2.75rem,9vw,7rem)]"
            immediate
          />

          <Reveal delay={0.1}>
            <p className="text-lead max-w-2xl !text-xl">{project.subtitle}</p>
          </Reveal>

          {project.links?.length ? (
            <Reveal delay={0.16}>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <Magnetic key={link.href} strength={0.22}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-medium text-white transition-colors duration-[260ms] hover:bg-brand-700"
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-[260ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </Magnetic>
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>
      </header>

      {/* --------------------------------------------------------- cover */}
      <div className="shell">
        <Reveal direction="up">
          <div className="overflow-hidden rounded-xl border border-line">
            <PlaceholderImage
              src={cover?.src}
              alt={`${project.title} cover`}
              label={`${project.title} — cover`}
              hint={`/images/work/${project.slug}-cover.jpg`}
              ratio={cover?.ratio ?? "16 / 9"}
              rounded="none"
              priority
              sizes="100vw"
            />
          </div>
        </Reveal>
      </div>

      {/* ---------------------------------------------------------- facts */}
      <section className="shell mt-16">
        <StaggerGroup className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <RevealItem className="bg-bg p-6">
            <p className="text-label text-fg-subtle">Role</p>
            <p className="mt-2 text-sm text-fg">{project.role}</p>
          </RevealItem>
          {project.facts.map((fact) => (
            <RevealItem key={fact.label} className="bg-bg p-6">
              <p className="text-label text-fg-subtle">{fact.label}</p>
              <p className="mt-2 text-sm text-fg">{fact.value}</p>
            </RevealItem>
          ))}
        </StaggerGroup>
      </section>

      {/* -------------------------------------------------------- content */}
      <section className="shell section-y grid gap-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-5">
            <Reveal>
              <h2 className="text-label text-accent">Overview</h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="text-[1.1875rem] leading-[1.7] text-fg">{project.summary}</p>
            </Reveal>
          </div>

          <div className="rule-fade" aria-hidden />

          <div className="flex flex-col gap-6">
            <Reveal>
              <h2 className="text-label text-accent">What I built</h2>
            </Reveal>
            <StaggerGroup className="flex flex-col gap-4">
              {project.highlights.map((point) => (
                <RevealItem key={point} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand/40 bg-[rgb(var(--brand-rgb)/0.08)]"
                  >
                    <Check className="h-3 w-3 text-accent" />
                  </span>
                  <p className="text-[1.0625rem] leading-relaxed text-fg-muted">{point}</p>
                </RevealItem>
              ))}
            </StaggerGroup>
          </div>
        </div>

        {/* Stack rail */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Reveal direction="left">
            <div className="rounded-xl border border-line bg-surface p-7">
              <h2 className="text-label text-fg-subtle">Stack &amp; tooling</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg-muted"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-line pt-6">
                <h3 className="text-label text-fg-subtle">Timeline</h3>
                <p className="mt-2 text-sm text-fg">{project.period}</p>
              </div>
            </div>
          </Reveal>
        </aside>
      </section>

      {/* -------------------------------------------------------- gallery */}
      <section className="shell flex flex-col gap-8 pb-24">
        <Reveal>
          <h2 className="text-label text-accent">Gallery</h2>
        </Reveal>

        <div className="grid items-start gap-5 md:grid-cols-2">
          {gallery.map((shot, i) => {
            // First tile spans full width — a lead shot for the case study.
            const wide = i === 0;
            return (
              <Reveal
                key={shot?.src ?? i}
                direction="up"
                delay={(i % 2) * 0.06}
                className={wide ? "md:col-span-2" : undefined}
              >
                <div className="overflow-hidden rounded-lg border border-line">
                  <PlaceholderImage
                    src={shot?.src}
                    alt={`${project.title} screen ${i + 1}`}
                    label={`Screen ${String(i + 1).padStart(2, "0")}`}
                    hint={`/images/work/${project.slug}-${String(i + 1).padStart(2, "0")}.jpg`}
                    ratio={shot?.ratio ?? (wide ? "16 / 9" : "4 / 3")}
                    rounded="none"
                    sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------ prev/next */}
      <nav aria-label="Project navigation" className="border-t border-line">
        <div className="shell grid gap-px sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="group flex flex-col gap-2 py-10 pr-6 transition-colors sm:border-r sm:border-line"
            >
              <span className="text-label inline-flex items-center gap-2 text-fg-subtle">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-[260ms] group-hover:-translate-x-1" />
                Previous
              </span>
              <span className="font-display text-2xl tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                {prev.title}
              </span>
            </Link>
          ) : null}

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex flex-col items-end gap-2 py-10 pl-6 text-right transition-colors"
            >
              <span className="text-label inline-flex items-center gap-2 text-fg-subtle">
                Next
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[260ms] group-hover:translate-x-1" />
              </span>
              <span className="font-display text-2xl tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                {next.title}
              </span>
            </Link>
          ) : null}
        </div>
      </nav>
    </article>
  );
}
